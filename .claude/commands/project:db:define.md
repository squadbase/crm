---
name: project:db:define
description: Create database tables
---

## Task Overview

This command creates the database schema definitions.

Example usage: `claude project:db:define`

Refer to the database specification in `docs/database.md` to create table definitions and seed data.
Check for differences between the current table definitions and `docs/database.md`, and update the table definitions and seed data to match `docs/database.md` as the source of truth.

## Target Files

- Create table definitions in `src/lib/db/schema.ts`.
- Create seed data in `src/lib/db/seed.ts`.
