# Local Setup & Customization

## Quick Start

This project is built with Next.js.

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

### Database

The development environment uses docker-compose to install PostgreSQL. Use the following commands for database operations:

```bash
npm run db:up       # Start database
npm run db:down     # Stop database
npm run db:restart  # Restart database
npm run db:migrate  # Run migrations
npm run db:seed     # Insert seed data
```

### Using Claude Code

Set up Claude Code to start using the system immediately.

**MCP Servers in use:**
- Playwright
- Context7

#### Claude Code Commands

Use these custom slash commands to build databases following unified rules:

```bash
/project:db:spec    # Build database specifications (docs/database.md)
/project:db:define  # Build database table definitions (src/lib/db/schema.ts)
/project:db:migrate # Run migrations (drizzle-kit migrate)
```