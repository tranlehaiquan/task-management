import { pgTable, uuid, varchar, timestamp, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { relations } from 'drizzle-orm';

export const tokenTypeEnum = pgEnum('token_type', [
  'email_verification',
  'password_reset',
]);

export const emailVerificationTokens = pgTable(
  'email_verification_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    email: varchar('email', { length: 255 }).notNull(), // at the time of creation, the email is not verified
    token: varchar('token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    type: tokenTypeEnum('type').notNull().default('email_verification'), // Add token type

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      userTypeUnique: unique('email_verification_tokens_user_id_type_unique').on(
        table.userId,
        table.type,
      ),
      tokenUnique: unique('email_verification_tokens_token_unique').on(
        table.token,
      ),
      expiresAtIdx: index('email_verification_tokens_expires_at_idx').on(
        table.expiresAt,
      ),
      tokenIdx: index('email_verification_tokens_token_idx').on(table.token),
      tokenTypeIdx: index('email_verification_tokens_token_type_idx').on(
        table.token,
        table.type,
      ),
    };
  },
);

export const emailVerificationTokenRelations = relations(
  emailVerificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerificationTokens.userId],
      references: [users.id],
    }),
  }),
);

export type EmailVerificationToken =
  typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken =
  typeof emailVerificationTokens.$inferInsert;
