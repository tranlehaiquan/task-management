import { pgTable, uuid, timestamp, text, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { tasks } from './tasks';
import { projects } from './projects';

export const timeEntries = pgTable('time_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  taskId: uuid('task_id').references(() => tasks.id),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  duration: integer('duration'), // in minutes
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type NewTimeEntry = typeof timeEntries.$inferInsert;