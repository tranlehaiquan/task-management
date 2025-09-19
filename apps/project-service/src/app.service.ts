import { Injectable, ConflictException } from '@nestjs/common';
import {
  DatabaseService,
  projects,
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
    await this.databaseService.db
      .delete(projects)
      .where(eq(projects.id, id))
      .execute();
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
    await this.databaseService.db
      .update(projects)
      .set({ ownerId: toUserId })
      .where(eq(projects.id, projectId))
      .execute();
    return {
      success: true,
      message: `Project with ID ${projectId} transferred to user with ID ${toUserId}.`,
    };
  }
}
