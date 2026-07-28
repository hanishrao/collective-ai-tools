# ARCHITECTURE

Date: 2026-07-27

## High-level shape

- The application is a single-page React catalog app.
- `src/index.tsx` mounts the app.
- `src/app.tsx` defines the top-level route tree and shell.
- The shell includes navigation, footer, back-to-top behavior, and error boundary protection.
- Major pages are code-split with lazy imports.

## Rendering flow

- Route changes trigger pageview capture.
- The main app shell renders persistent navigation around route content.
- Feature pages own their own local filtering and list state.
- Shared UI atoms live under `src/components/ui`.
- Global layout and reset rules come from `src/styles/globals.css`.

## Data flow

- The UI requests data through helper functions in `src/lib/api.ts`.
- Some screens fetch immediately on mount.
- Some screens hydrate from local storage first and then reconcile with fetched data.
- Mock handlers can replace API responses during local development.
- Errors are surfaced through component state and empty states.

## Major domains

- Discovery catalog pages list AI tools and MCP servers.
- Admin pages manage submissions, users, prompts, servers, clients, and taxonomy.
- Community and comparison pages support browsing and ranking.
- Skills pages support marketplace and submission flows.
- Authentication is context-driven and component-scoped.

## Client-side state

- Favorites and click counts are persisted in browser storage.
- Navigation drawer state is controlled in the navigation component.
- Filters are often kept in component state rather than a global store.
- Comparison and saved lists are assembled client side.
- The app does not depend on a heavyweight global state library.

## Security posture

- HTML content is sanitized before rendering.
- URLs are validated before use.
- Outbound links are decorated with tracking parameters in a controlled way.
- CSP generation exists as a helper, but hosting policy still matters.
- Client auth should be treated as UX support, not a trust boundary.

## Architectural strengths

- Small reusable UI primitives keep pages consistent.
- Route-level code splitting keeps the initial bundle smaller.
- API helpers centralize retries and error handling.
- Mocking makes development possible without the backend.
- Utility modules separate security, analytics, and transport concerns.

## Architectural pressure points

- Several feature pages are large client components.
- Local storage is doing a lot of work.
- There is no obvious shared server-side domain layer in this repo.
- Data contracts are implied by API usage and mocks rather than generated types.
- If the backend shape changes, multiple screens may need coordinated updates.
