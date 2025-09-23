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
  type NewProject,
  NewProjectMember,
  Project,
} from '@task-mgmt/database';
import { UpdateProjectDto } from './dto/update-project.dto';
import { eq, count, asc, and } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { CreateMembersDto } from './dto/create-member.dto';

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

      try {
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
      } catch (error) {
        // If transaction failed, re-throw the error
        throw error;
      }
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

  async createMembers(data: CreateMembersDto) {
    const { projectId, members } = data;

    const projectRecord = await this.databaseService.db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!projectRecord) {
      return {
        success: false,
        message: `Can't front project`,
        code: 'PROJECT_NOT_FOUNT',
      };
    }

    const newMembers: NewProjectMember[] = members.map((i) => ({
      projectId,
      ...i,
    }));

    const membersRecord = await this.databaseService.db
      .insert(projectMembers)
      .values(newMembers)
      .returning()
      .execute();

    return {
      success: true,
      message: `Added ${membersRecord.length} members to project`,
      data: membersRecord,
    };
  }

  async checkOwnership(projectId: string, userId: string): Promise<boolean> {
    const [member] = await this.databaseService.db
      .select({ role: projectMembers.role })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
          eq(projectMembers.role, 'owner'),
        ),
      )
      .execute();

    return !!member;
  }
}
