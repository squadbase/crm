# Local Setup & Customization

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/squadbase/crm.git
cd crm
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit the `.env` file to set up the environment variables.

```bash
# These are the default value the docker-compose.yml file uses.
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=crm_db

LANGUAGE=en
CURRENCY=usd
```

For more information about language and currency, see [Internationalization](./i18n.md).

### 4. Run the development server

```bash
npm run db:up # Start database
npm run dev # Start the development server
```

## Database Operations

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