-- Step 1: Add nullable slug column
ALTER TABLE "projects" ADD COLUMN "slug" varchar(255);--> statement-breakpoint

-- Step 2: Backfill slug values for existing rows using slugified names
UPDATE "projects" 
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRIM("name"), 
      '[^a-zA-Z0-9]+', '-', 'g'
    ), 
    '^-+|-+$', '', 'g'
  )
) 
WHERE "slug" IS NULL;--> statement-breakpoint

-- Step 3: Set NOT NULL constraint
ALTER TABLE "projects" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint

-- Step 4: Create unique index (with IF NOT EXISTS equivalent)
CREATE UNIQUE INDEX IF NOT EXISTS "projects_slug_unique" ON "projects" ("slug");