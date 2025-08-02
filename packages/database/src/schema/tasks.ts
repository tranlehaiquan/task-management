import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { projects } from './projects';

export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done', 'cancelled']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent']);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('todo'),
  priority: taskPriorityEnum('priority').default('medium'),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  assigneeId: uuid('assignee_id').references(() => users.id),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;