# speckit-workshop-ui

## Active Technologies

React 19 + TypeScript + Vite + MUI, Clean Architecture / DDD, TanStack Query,
React Router v7, Orval (OpenAPI), Vitest + Playwright, MSW, react-i18next, pnpm.

## Commands

- `pnpm dev` — dev server
- `pnpm lint` — ESLint (0 warnings required)
- `pnpm type-check` — TypeScript check
- `pnpm test:run` — unit tests (Vitest)
- `pnpm test:e2e` — E2E (Playwright)
- `pnpm gen:api` — generate API client from OpenAPI (Orval)

## Conventions

- Layout: `src/{domain,adapters,app,i18n,presentations}`
- Props as `interface`, components as `React.FC`, logic in `use*` hooks
- Import MUI individually; style via theme in `styled.tsx`
- No hardcoded UI text — use `useTypedTranslation` (`t(tKeys...)`)
- Details: `.github/instructions/*.instructions.md`

## Recent Changes

- Consolidated agent instructions into AGENTS.md; added cline/gemini integrations.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
