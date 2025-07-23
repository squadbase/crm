# CLAUDE.md - AI Assistant Development Guide for Squadbase CRM

## 📋 Repository Overview

This repository contains a Customer Relationship Management (CRM) application for Squadbase, built with modern web technologies to manage customer data, orders, subscriptions, and business analytics.

## 🛠️ Technology Stack

### Core Technologies
- **Next.js v15** - React framework with App Router
- **TailwindCSS v4** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Database (hosted on Neon)

### Important Notes
- **Authentication is not implemented** - No user authentication system required
- **Development focus** - Business logic and data management features

---

## ⚙️ Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root with the following variables:

```env
POSTGRES_HOST=your_postgres_host
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=crm_db
```

### SSL Configuration
- `POSTGRES_SSL` options: `'true'`, `'false'`, `'require'`, or `'auto'`
- When set to `'auto'`, SSL is automatically detected based on environment

---

## 🐘 Database Management

### Development Setup
Use Docker Compose to run PostgreSQL locally during development:

```bash
docker-compose up -d postgres
```

### Database Operations
- **All database operations** must use Drizzle ORM functions
- **Migrations** are mandatory when creating or updating tables
- **Seed data** must be created for every migration

### Development Workflow
When running `npm run dev`:
1. Ask if data initialization is needed
2. If yes, execute the following steps:
   - Delete all relevant tables
   - Run `npm run seed`

### Database Files Structure
```
src/lib/db/
├── schema.ts      # Database table definitions
├── seed.ts        # Seed data for development
└── index.ts       # Database connection and configuration
```

### Documentation Reference
- Database specifications: `docs/database.md`
- Follow the specifications for table and seed creation

---

## 🔄 Development Workflow

### Standard Development Process
1. **Identify Requirements** - Clearly define the changes to implement
2. **Implement Changes** - Develop the required functionality
3. **Browser Testing** - Verify implementation works correctly in browser
4. **Fix Issues** - Address any problems found during testing
5. **Iterate** - Repeat steps 1-4 until implementation meets requirements
6. **Complete Task** - Finish when functionality works as intended

### Screenshot and Testing
- **Always use Playwright MCP** for taking screenshots
- **Never use `npm run dev`** directly for testing (blocks screenshot functionality)
- **Use tmux sessions** instead for development server

### Development Server Configuration
```bash
# Use tmux for development server
tmux new-session -d -s crm-dev
tmux send-keys -t crm-dev 'npm run dev' C-m

# Development server runs on port 7777
```

### Session Management
- **Always close tmux sessions** when finishing tasks
- **Clean up resources** to avoid conflicts

---

## 🎨 Styling Guidelines

### TailwindCSS Configuration Issue

This project has known issues with custom TailwindCSS classes (`text-heading`, `bg-primary-100`, etc.) due to TailwindCSS v4 and Next.js 15 compatibility problems.

### Recommended Color Palette

```css
/* Primary Colors */
--primary-blue: #2563eb
--text-primary: #0f172a
--text-secondary: #6b7280

/* Gray Scale */
--gray-50: #f9fafb
--gray-200: #e5e7eb
--gray-400: #9ca3af
--gray-600: #4b5563
--gray-800: #1f2937
```

---

## 📐 Layout Guidelines

### Page Header Standardization

Use the `PageHeader` component for consistent page headers across the application.

#### Usage Example

```tsx
import { PageHeader } from '@/components/layout/PageHeader';

// Define header actions
const headerActions = (
  <>
    <button>Action 1</button>
    <button>Action 2</button>
  </>
);

// Use in page component
<PageHeader
  title="Page Title"
  description="Brief description of page purpose in 1-2 sentences"
  actions={headerActions}
/>
```

#### Design Principles

1. **Title** - Clear nouns indicating page purpose (e.g., Dashboard, Customer Management)
2. **Description** - Concise 1-2 sentence explanation of page functionality
3. **Actions** - Primary operation buttons positioned at the right
4. **Responsive** - Elements stack vertically on smaller screens

### Responsive Design

#### Breakpoints
- **Mobile:** `< 768px`
- **Desktop:** `≥ 768px` (Tailwind `md:` prefix)

#### Mobile Adaptations
- **Sidebar:** Fixed slide menu (260px width)
- **Navigation:** Hamburger menu toggle
- **Page Headers:** Actions stack vertically
- **Tables/Grids:** Horizontal scroll support

#### Sidebar Specifications
- **Width:** 260px (desktop and mobile)
- **Header:** 16px font, 20px padding
- **Navigation Items:** 14px font, 10px padding, 18px icons
- **Item Spacing:** 4px between items

---

## 🌐 Internationalization

### Multi-language Support Requirements

**All UI components** must support internationalization for English and Japanese languages.

#### Implementation Guidelines
- Use the `useClientI18n` hook for translations
- Add translation keys to `src/lib/i18n.ts`
- Support both English and Japanese text
- Ensure all user-facing text is translatable

#### Translation Usage
```tsx
import { useClientI18n } from '@/hooks/useClientI18n';

function Component() {
  const { t } = useClientI18n();

  return <h1>{t('pageTitle')}</h1>;
}
```

---

## 📝 Development Best Practices

### Code Quality
- Write clean, readable code with English comments
- Use TypeScript for all components and functions
- Follow React best practices and hooks guidelines
- Implement proper error handling

### Testing
- Test all functionality in browser before completion
- Verify responsive design across different screen sizes
- Ensure internationalization works correctly
- Test database operations thoroughly

### File Organization
- Follow established folder structure
- Use descriptive component and function names
- Separate concerns appropriately
- Maintain consistent coding style

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run seed

# Start development server (use tmux)
tmux new-session -d -s crm-dev
tmux send-keys -t crm-dev 'npm run dev' C-m

# Build for production
npm run build

# Start production server
npm start
```

---

*This document serves as the primary reference for AI assistants working on the Squadbase CRM project. Follow these guidelines to ensure consistent, high-quality development practices.*