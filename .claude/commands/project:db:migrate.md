---
name: project:db:migrate
description: Create database tables
---

## Task Overview

This command creates the database tables.

Example usage: `claude project:db:migrate`

Migrate the tables defined in `src/lib/db/schema.ts` and `src/lib/db/seed.ts`.
Always use the DB-related commands defined in `package.json` for table migrations.

## Target

Start the database using Docker and perform the migration.