import { Injectable } from '@nestjs/common';
import {
  DatabaseService,
  projects,
  type NewProject,
  type UpdateProject,
} from '@task-mgmt/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  createSlug(name: string): string {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const namePart = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);

    return `${namePart}-${randomSuffix}`;
  }

  create(data: NewProject) {
    const slug = this.createSlug(data.name);

    return this.databaseService.db
      .insert(projects)
      .values({
        ...data,
        slug: data.slug ?? slug,
      })
      .returning()
      .execute();
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
    const offset = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      this.databaseService.db
        .select()
        .from(projects)
        .limit(limit)
        .offset(offset)
        .execute(),
      this.databaseService.db
        .select({ count: projects.id })
        .from(projects)
        .execute(),
    ]);

    const total = totalCount.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
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

  async updateProject(data: UpdateProject) {
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
