import { pgTable, uuid, varchar, timestamp, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { projects, projectRoles } from './projects';
import { relations } from 'drizzle-orm';

export const invitationStatusEnum = pgEnum('invitation_status', [
  'pending',
  'accepted', 
  'declined',
  'expired',
]);

export const projectInvitations = pgTable(
  'project_invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    
    // Core invitation fields
    email: varchar('email', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    
    // Project context (always required)
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    role: projectRoles('role').notNull(),
    invitedBy: uuid('invited_by')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    
    // Invitation lifecycle
    status: invitationStatusEnum('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    acceptedAt: timestamp('accepted_at'),
    
    // User reference (set when accepted, if user exists)
    acceptedBy: uuid('accepted_by')
      .references(() => users.id, { onDelete: 'set null' }),
    
    // Audit
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraints
    tokenUnique: unique('project_invitations_token_unique').on(table.token),
    emailProjectUnique: unique('project_invitations_email_project_unique').on(
      table.email, 
      table.projectId
    ), // Prevent duplicate invites to same email+project
    
    // Indexes for performance
    emailIdx: index('project_invitations_email_idx').on(table.email),
    tokenIdx: index('project_invitations_token_idx').on(table.token),
    projectIdIdx: index('project_invitations_project_id_idx').on(table.projectId),
    statusIdx: index('project_invitations_status_idx').on(table.status),
    expiresAtIdx: index('project_invitations_expires_at_idx').on(table.expiresAt),
    invitedByIdx: index('project_invitations_invited_by_idx').on(table.invitedBy),
    
    // Composite indexes for common queries
    projectStatusIdx: index('project_invitations_project_status_idx').on(
      table.projectId, 
      table.status
    ),
    emailStatusIdx: index('project_invitations_email_status_idx').on(
      table.email, 
      table.status
    ),
  }),
);

export const projectInvitationRelations = relations(projectInvitations, ({ one }) => ({
  project: one(projects, {
    fields: [projectInvitations.projectId],
    references: [projects.id],
  }),
  inviter: one(users, {
    fields: [projectInvitations.invitedBy],
    references: [users.id],
    relationName: 'inviter',
  }),
  acceptedByUser: one(users, {
    fields: [projectInvitations.acceptedBy],
    references: [users.id],
    relationName: 'acceptedBy',
  }),
}));

export type ProjectInvitation = typeof projectInvitations.$inferSelect;
export type NewProjectInvitation = typeof projectInvitations.$inferInsert;
