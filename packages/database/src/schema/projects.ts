import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type UpdateProject = Pick<Project, 'id' | 'name' | 'description'>;

const PROJECT_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;

export type ProjectRole = (typeof PROJECT_ROLES)[number];
export const projectRoles = pgEnum('project_role', PROJECT_ROLES);

export const projectMembers = pgTable(
  'project_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    role: projectRoles('role').default('member').notNull(),
    addedAt: timestamp('added_at').defaultNow(),
  },
  (table) => ({
    // Unique constraint to ensure one user can only be added to a project once
    uniqueProjectUser: unique('unique_project_user').on(
      table.projectId,
      table.userId,
    ),
  }),
);

export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;
