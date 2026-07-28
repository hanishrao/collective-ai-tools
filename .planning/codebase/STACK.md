# STACK

Date: 2026-07-27

## Summary

- Product: curated AI tools and discovery catalog.
- Frontend: React 18 + TypeScript + Vite SPA.
- Styling: Tailwind CSS plus `src/styles/globals.css`.
- Routing: `react-router-dom`.
- State: React context, component state, local storage, and request cache patterns.
- Data access: fetch-based helper wrappers under `src/lib`.
- Testing: Vitest, Testing Library, MSW, and Playwright listed in the toolchain.
- Quality: ESLint, TypeScript strictness, and security helpers.

## Runtime

- Node requirement is `>=20.0.0`.
- Package manager is `pnpm`.
- Dev server is Vite.
- Production build is Vite static output.
- The app expects browser APIs such as `localStorage`, `window`, and `document`.

## Core dependencies

- `react` and `react-dom` drive the UI.
- `react-router-dom` drives page transitions.
- `lucide-react` provides icons.
- `posthog-js` handles analytics.
- `zod` supports runtime validation.
- `react-markdown`, `rehype-raw`, `rehype-sanitize`, and `remark-gfm` render content safely.
- `isomorphic-dompurify` sanitizes user or remote content.
- `class-variance-authority`, `clsx`, and `tailwind-merge` support UI composition.

## Tooling

- ESLint config lives in `eslint.config.js`.
- Vitest config lives in `vitest.config.ts`.
- Vite config lives in `vite.config.ts`.
- TypeScript config lives in `tsconfig.json`.
- PWA support is enabled in Vite config.
- The build pipeline includes a README copy step before build.

## Operational notes

- `/api` is proxied to `http://localhost:3001` in development.
- Mock Service Worker handlers are available in `src/mocks/handlers.ts`.
- Auth is handled by the frontend context in `src/context/AuthContext.tsx`.
- Analytics is lazy-loaded and production-gated in `src/lib/analytics.ts`.
- Security helpers live in `src/lib/security.ts`.
- Browser storage is used for hints, favorites, and click counts.

## Practical implications

- The repo is mostly frontend, not a separate agent server.
- Backend availability matters for real API behavior.
- Test coverage should emphasize data flow and rendered UI states.
- Shared utilities should be reused before introducing new abstractions.
