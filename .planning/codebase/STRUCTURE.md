# STRUCTURE

Date: 2026-07-27

## Top-level layout

- `src/` contains the application source.
- `test/` contains testing setup utilities.
- `scripts/` contains build-time helpers.
- `public/` holds static assets and generated metadata.
- `.planning/` stores workflow artifacts and codebase maps.
- `dist/` is the build output directory.

## Source tree

- `src/app.tsx` is the route composition layer.
- `src/index.tsx` is the application bootstrap.
- `src/components/` holds feature and shared UI.
- `src/components/ui/` holds primitives such as button, card, input, table, textarea, and badge.
- `src/components/discover/` holds the discovery/search subsystem.
- `src/components/admin/` holds admin dashboards and resource managers.
- `src/components/tools/` holds tool card and tool-oriented UI.
- `src/context/` holds providers like auth.
- `src/lib/` holds utilities, fetch helpers, sanitizers, analytics, and link helpers.
- `src/mocks/` holds MSW handler definitions.
- `src/types/` holds shared TypeScript types.

## Key files

- `package.json` defines scripts and dependencies.
- `vite.config.ts` configures dev server, proxy, and PWA behavior.
- `eslint.config.js` defines linting rules.
- `vitest.config.ts` defines unit test behavior.
- `tsconfig.json` defines compiler and alias settings.
- `index.html` loads the app shell and metadata.
- `ai-manifest.json` describes the project as an AI tools site.

## Component organization

- Large routes are lazy-loaded from `src/app.tsx`.
- Shared shell UI is kept separate from page content.
- Page-level filtering is usually colocated with the page component.
- Admin modules are grouped by resource type.
- Discovery modules are grouped by search and ranking behavior.

## Naming patterns

- Components use PascalCase filenames.
- Hooks and helpers use camelCase filenames.
- UI primitives stay short and generic.
- Tests follow the `*.test.ts(x)` naming pattern.
- Mock handlers are grouped by endpoint domain.

## Dependency boundaries

- `src/lib/` should stay framework-light.
- UI atoms should not import page-level logic.
- Admin modules should not leak into public browsing pages.
- Network behavior should route through helper modules where possible.
- Browser-only code should be guarded for SSR safety even if the app is client-first.

## Maintenance notes

- Feature additions should prefer existing folders over creating new top-level areas.
- Shared behavior belongs in `src/lib` or `src/components/ui` before duplication.
- New pages should be registered in the route tree instead of being mounted ad hoc.
- Cross-cutting state should be introduced carefully to avoid widening coupling.
- When a folder grows large, split by feature domain rather than by technical layer alone.
