# Kayan Sweets Frontend — Coding Standards

NON-NEGOTIABLE. Every task must comply.

## Repo Hygiene
1. This is the FRONTEND repo. The backend lives at kayan-backend. Do NOT create
   backend code, database schemas, or server logic here.
2. Workspace .md files are gitignored. .cursor/ is gitignored.

## TypeScript
3. strict mode. 'any' is forbidden. Use 'unknown' and narrow.
4. Every interface in its own file under src/interfaces/<module>/<Name>.ts.
5. Return types on exported components and functions.
6. Props interfaces use the pattern: interface ComponentNameProps { ... }

## Environment & Constants
7. import.meta.env is accessed ONLY in src/config/env.ts. Import 'env' elsewhere.
8. No magic strings. All routes, error codes, UI values live in src/constants/.

## API & Data
9. All HTTP calls go through src/lib/api.ts. Never call axios or fetch directly
   in components. Every API call returns an unwrapped T (the axios interceptor
   unwraps ApiResponse).
10. Client-side validation uses zod, the same library as the backend.

## Components
11. Components live in src/components/<domain>/. Pages live in src/pages/.
12. Styling uses Tailwind utility classes. Avoid custom CSS except for animations.
13. Always support RTL. Use logical properties (start/end) or Tailwind RTL variants.
14. Always provide both Arabic and English copy via i18next. Never hardcode strings.

## Logging
15. console.* is FORBIDDEN. Use logger from src/lib/logger.ts. ESLint blocks it.

## Workflow
16. READ PROJECT_LOG.md at the start of every task.
17. UPDATE PROJECT_LOG.md at the end of every task.
18. If a standard conflicts with a task, flag it before proceeding.
