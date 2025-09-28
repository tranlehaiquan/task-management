import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  DatabaseService,
  projects,
  users,
  projectMembers,
  Project,
  ProjectMember,
  PG_ERROR_CODES,
  isPostgresError,
} from '@task-mgmt/database';
import { UpdateProjectDto } from './dto/update-project.dto';
import { eq, count, asc, and, ne } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  createSlug(name: string): string {
    const randomSuffix = randomBytes(4).toString('hex'); // 8 characters
    const namePart = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);

    return `${namePart}-${randomSuffix}`;
  }

  async create(data: {
    name: string;
    description?: string;
    slug?: string;
    ownerId: string;
  }) {
    const base = data.slug ?? this.createSlug(data.name);
    const { ownerId, ...projectData } = data;

    for (let i = 0; i < 3; i++) {
      const candidate = i === 0 ? base : `${base}-${i}`;

      const result = await this.databaseService.db.transaction(async (tx) => {
        // Attempt to insert the project
        const [created] = await tx
          .insert(projects)
          .values({ ...projectData, slug: candidate })
          .onConflictDoNothing({ target: projects.slug })
          .returning()
          .execute();

        // If project creation failed due to conflict, return null
        if (!created) {
          return null;
        }

        // Insert the owner as a project member
        await tx
          .insert(projectMembers)
          .values({
            projectId: created.id,
            userId: ownerId,
            role: 'owner',
          })
          .execute();

        return created;
      });

      // If transaction succeeded and project was created
      if (result) {
        return {
          success: true,
          message: 'Project created successfully',
          data: result,
        };
      }

      // If result is null, it means slug conflict - continue to next iteration
    }

    throw new ConflictException(
      'Could not generate a unique slug. Please try again.',
    );
  }

  async findById(id: string) {
    const [project] = await this.databaseService.db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .execute();
    return project;
  }

  async getAll(page: number = 1, limit: number = 10) {
    // Input validation - clamp page and limit values
    const MIN_PAGE = 1;
    const MIN_LIMIT = 1;
    const MAX_LIMIT = 100;

    const clampedPage = Math.max(MIN_PAGE, page);
    const clampedLimit = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, limit));
    const offset = (clampedPage - 1) * clampedLimit;

    const [data, [{ count: total }]] = await Promise.all([
      this.databaseService.db
        .select()
        .from(projects)
        .orderBy(asc(projects.id))
        .limit(clampedLimit)
        .offset(offset)
        .execute(),
      this.databaseService.db
        .select({ count: count() })
        .from(projects)
        .execute(),
    ]);

    const totalPages = Math.ceil(total / clampedLimit);

    return {
      data,
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total,
        totalPages,
        hasNext: clampedPage < totalPages,
        hasPrev: clampedPage > 1,
      },
    };
  }

  async deleteProject(id: string) {
    const [deleted] = await this.databaseService.db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ id: projects.id })
      .execute();
    if (!deleted) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return {
      success: true,
      message: `Project with ID ${id} deleted.`,
    };
  }

  async updateProject(data: UpdateProjectDto) {
    const { id, ...updateData } = data;

    const [project] = await this.databaseService.db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning()
      .execute();
    return project;
  }

  async transferProject(projectId: string, toUserId: string) {
    // Step 1: Validate project exists
    const [project] = await this.databaseService.db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .execute();

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Step 2: Get current owner from projectMembers
    const [currentOwner] = await this.databaseService.db
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.role, 'owner'),
        ),
      )
      .execute();

    if (!currentOwner) {
      throw new NotFoundException(
        `Current owner not found for project ${projectId}`,
      );
    }

    // Step 3: Check for no-op transfer (same owner)
    if (currentOwner.userId === toUserId) {
      throw new BadRequestException(
        'Project is already owned by the specified user - no transfer needed',
      );
    }

    // Step 4: Validate target user exists
    const [targetUser] = await this.databaseService.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, toUserId))
      .execute();

    if (!targetUser) {
      throw new NotFoundException(`User with ID ${toUserId} not found`);
    }

    // Step 5: Validate target user is a project member
    const [membership] = await this.databaseService.db
      .select({
        id: projectMembers.id,
        role: projectMembers.role,
      })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, toUserId),
        ),
      )
      .execute();

    if (!membership) {
      throw new BadRequestException(
        'Target user must be a project member before ownership can be transferred',
      );
    }

    // Step 6: Perform transfer in transaction
    await this.databaseService.db.transaction(async (tx) => {
      // Update current owner to admin role
      await tx
        .update(projectMembers)
        .set({ role: 'admin' })
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, currentOwner.userId),
          ),
        )
        .execute();

      // Update new owner to owner role
      await tx
        .update(projectMembers)
        .set({ role: 'owner' })
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, toUserId),
          ),
        )
        .execute();

      // Update project timestamp
      await tx
        .update(projects)
        .set({ updatedAt: new Date() })
        .where(eq(projects.id, projectId))
        .execute();
    });

    return {
      success: true,
      message: `Project with ID ${projectId} transferred to user with ID ${toUserId}.`,
    };
  }

  async createMember(data: CreateMemberDto) {
    const { projectId, userId, role } = data;

    try {
      // Single query: let database constraints handle validation
      const [memberRecord] = await this.databaseService.db
        .insert(projectMembers)
        .values({ projectId, userId, role })
        .returning()
        .execute();

      return {
        success: true,
        message: `Added member to project`,
        data: memberRecord,
      };
    } catch (error) {
      // Handle specific database constraint violations
      if (!isPostgresError(error)) {
        throw error;
      }

      if (error.code === PG_ERROR_CODES.FOREIGN_KEY_VIOLATION) {
        // Foreign key violation
        if (error.constraint?.includes('project_id')) {
          return {
            success: false,
            message: `Can't find project`,
            code: 'PROJECT_NOT_FOUND',
          };
        }
        if (error.constraint?.includes('user_id')) {
          return {
            success: false,
            message: `Can't find user`,
            code: 'USER_NOT_FOUND',
          };
        }
      }

      if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
        // Unique constraint violation
        return {
          success: false,
          message: `Member already exists`,
          code: 'MEMBER_ALREADY_EXISTS',
        };
      }
    }
  }

  async validateProjectOwnership(
    projectId: string,
    userId: string,
  ): Promise<
    | {
        success: true;
        project?: Project;
      }
    | {
        success: false;
        code: 'PROJECT_NOT_FOUND' | 'FORBIDDEN';
      }
  > {
    // Single query with JOIN to atomically check both project existence and ownership
    const [result] = await this.databaseService.db
      .select({
        project: projects,
        isOwner: projectMembers.role,
      })
      .from(projects)
      .leftJoin(
        projectMembers,
        and(
          eq(projectMembers.projectId, projects.id),
          eq(projectMembers.userId, userId),
          eq(projectMembers.role, 'owner'),
        ),
      )
      .where(eq(projects.id, projectId))
      .execute();

    if (!result?.project) {
      return {
        success: false,
        code: 'PROJECT_NOT_FOUND',
      };
    }

    if (!result.isOwner) {
      return {
        success: false,
        code: 'FORBIDDEN',
      };
    }

    return {
      success: true,
      project: result.project,
    };
  }

  async getProjectMemberByProjectIdAndUserId(params: {
    projectId: string;
    userId: string;
  }): Promise<ProjectMember | null> {
    const { projectId, userId } = params;
    const [member] = await this.databaseService.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
        ),
      )
      .execute();

    return member || null;
  }

  async getProjectMembersByProjectId(
    projectId: string,
  ): Promise<(ProjectMember & { user: { email: string; name: string } })[]> {
    const members = await this.databaseService.db
      .select({
        id: projectMembers.id,
        projectId: projectMembers.projectId,
        userId: projectMembers.userId,
        role: projectMembers.role,
        addedAt: projectMembers.addedAt,
        user: {
          email: users.email,
          name: users.name,
        },
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, projectId))
      .execute();

    return members;
  }

  async deleteMember(params: { projectId: string; memberId: string }) {
    const { projectId, memberId } = params;
    const [member] = await this.databaseService.db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.id, memberId),
          // and the role must not be owner
          ne(projectMembers.role, 'owner'),
        ),
      )
      .returning()
      .execute();

    if (!member) {
      return {
        success: false,
        message: `Member not found`,
        code: 'MEMBER_NOT_FOUND',
      };
    }

    return {
      success: true,
      message: `Member deleted`,
    };
  }
}
