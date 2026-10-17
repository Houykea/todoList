# Todo List

A full-stack todo application with a NestJS + PostgreSQL REST API and a React (Vite) frontend.

## Project structure

```
toDoList/
├── todo-list-api/     # Backend — NestJS 12 + TypeORM + PostgreSQL
└── todoList-front/    # Frontend — React 19 + Vite + Tailwind CSS v4 + shadcn/ui
```

Each subproject has its own `package.json` and is run independently.

## Tech stack

**Backend (`todo-list-api`)**
- NestJS 12 (ESM) with a global `/api` route prefix
- TypeORM 0.3 with PostgreSQL (`pg`)
- `class-validator` / `class-transformer` for request validation
- Vitest for unit and e2e tests, oxlint for linting

**Frontend (`todoList-front`)**
- React 19 + Vite
- Tailwind CSS v4 and shadcn/ui components
- TypeScript, ESLint, Prettier

## Prerequisites

- Node.js 20+ (24 type definitions are used)
- A running PostgreSQL instance

## Getting started

### 1. Database

The backend expects a PostgreSQL database with these defaults (see `todo-list-api/src/data-source.ts` and `src/app.module.ts`):

| Setting  | Value       |
| -------- | ----------- |
| host     | `localhost` |
| port     | `5432`      |
| username | `postgres`  |
| password | `postgres`  |
| database | `todo`      |

Create the database before running the API:

```sql
CREATE DATABASE todo;
```

> Note: these credentials are currently hardcoded. For anything beyond local development, move them to environment variables.

### 2. Backend

```bash
cd todo-list-api
npm install

# Apply the schema (synchronize is off; migrations are the source of truth)
npm run migration:run

# Start in watch mode
npm run start:dev
```

The API runs on `http://localhost:3000` with all routes under the `/api` prefix. CORS is enabled for the Vite dev server at `http://localhost:5173`.

### 3. Frontend

```bash
cd todoList-front
npm install
npm run dev
```

The app runs on `http://localhost:5173` and talks to the API at `http://localhost:3000/api`.

## API

Base URL: `http://localhost:3000/api`

### Todos

| Method   | Path          | Description               | Success status |
| -------- | ------------- | ------------------------- | -------------- |
| `POST`   | `/todos`      | Create a todo             | 201            |
| `GET`    | `/todos`      | List all todos (id ASC)   | 200            |
| `GET`    | `/todos/:id`  | Get a single todo         | 200            |
| `PATCH`  | `/todos/:id`  | Update a todo             | 200            |
| `DELETE` | `/todos/:id`  | Delete a todo             | 204            |

### Todo model

```ts
{
  id: number        // auto-generated
  title: string     // required, max 200 chars
  status: string    // "TODO" | "IN_PROGRESS" | "DONE", defaults to "TODO"
}
```

### Create payload

```json
{
  "title": "Buy groceries",
  "status": "TODO"
}
```

`title` is required (non-empty, max 200 chars). `status` is optional and must be one of `TODO`, `IN_PROGRESS`, `DONE`. Unknown IDs return `404 Not Found`.

## Scripts

### Backend (`todo-list-api`)

| Script                      | Description                        |
| --------------------------- | ---------------------------------- |
| `npm run start:dev`         | Start with watch mode              |
| `npm run start:prod`        | Run the compiled build             |
| `npm run build`             | Build to `dist/`                   |
| `npm run migration:generate`| Generate a migration from entities |
| `npm run migration:run`     | Apply pending migrations           |
| `npm test`                  | Run unit tests (Vitest)            |
| `npm run test:e2e`          | Run e2e tests                      |
| `npm run lint`              | Lint with oxlint                   |

### Frontend (`todoList-front`)

| Script            | Description               |
| ----------------- | ------------------------- |
| `npm run dev`     | Start the Vite dev server |
| `npm run build`   | Type-check and build      |
| `npm run preview` | Preview the build         |
| `npm run lint`    | Lint with ESLint          |
| `npm run typecheck` | Type-check only         |

## Notes

- Database credentials are hardcoded for local development; externalize them before deploying.
- `synchronize` is disabled in TypeORM — schema changes go through migrations in `todo-list-api/src/migrations/`.
- The `app.module.ts` includes a `@nestjs/observe` module configured with placeholder `appKey`/`appSecret`; replace or remove it as needed.
