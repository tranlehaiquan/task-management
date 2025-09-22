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
  type NewProject,
} from '@task-mgmt/database';
import { UpdateProjectDto } from './dto/update-project.dto';
import { eq, count, asc } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';

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

  async create(data: NewProject) {
    const base = data.slug ?? this.createSlug(data.name);
    for (let i = 0; i < 3; i++) {
      const candidate = i === 0 ? base : `${base}-${i + 1}`;
      const [created] = await this.databaseService.db
        .insert(projects)
        .values({ ...data, slug: candidate })
        .onConflictDoNothing({ target: projects.slug })
        .returning()
        .execute();
      if (created) return created;
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

    // Step 2: Check for no-op transfer (same owner)
    if (project.ownerId === toUserId) {
      throw new BadRequestException(
        'Project is already owned by the specified user - no transfer needed',
      );
    }

    // Step 3: Validate target user exists
    const [targetUser] = await this.databaseService.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, toUserId))
      .execute();

    if (!targetUser) {
      throw new NotFoundException(`User with ID ${toUserId} not found`);
    }

    // Step 4: Perform transfer in transaction
    await this.databaseService.db.transaction(async (tx) => {
      await tx
        .update(projects)
        .set({
          ownerId: toUserId,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId))
        .execute();
    });

    return {
      success: true,
      message: `Project with ID ${projectId} transferred to user with ID ${toUserId}.`,
    };
  }
}
