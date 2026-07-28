# INTEGRATIONS

Date: 2026-07-27

## External services

- Backend API is addressed through `/api`.
- Development requests are proxied to `http://localhost:3001`.
- The app expects endpoints for tools, MCP data, filters, prompts, skills, stats, and submissions.
- Auth endpoints live under `/api/auth/*`.
- Analytics is implemented with PostHog.

## API surfaces

- `src/lib/api.ts` provides fetch helpers with retry and backoff.
- `fetchFilters()` loads filter metadata.
- `fetchMCPServers()` loads MCP server data.
- `fetchAITools()` loads AI tool catalog data.
- Request parameters are passed as query objects and serialized by the helper.
- Errors are normalized to support user-facing fallback UI.

## Authentication flow

- `src/context/AuthContext.tsx` owns sign-in, sign-up, logout, and session checks.
- Login posts to `/api/auth/login`.
- Registration posts to `/api/auth/register`.
- Session validation hits `/api/auth/me`.
- Logout hits `/api/auth/logout`.
- A local storage hint tracks the last successful auth state.

## Analytics and telemetry

- `src/lib/analytics.ts` lazy-loads PostHog in production.
- Page views are captured manually on route change.
- Persistence is in-memory rather than cookie based.
- This reduces tracking surface but keeps analytics lightweight.

## Content and safety

- `src/lib/security.ts` sanitizes HTML and URLs.
- DOMPurify is used before rendering rich or remote content.
- Tool validation checks structure before display.
- CSP helper output can be reused in hosting or edge configuration.

## Mocking and fallback

- MSW handlers in `src/mocks/handlers.ts` cover the primary API shapes.
- Mock data exists for auth, stats, submissions, prompts, skills, and catalog endpoints.
- This supports local development without a live backend.
- `src/index.tsx` determines whether the mock layer or the real API path is active.

## Integration risks

- Real API and mock API can drift if both are not exercised regularly.
- A missing backend at `localhost:3001` will break live data fetches.
- Analytics should remain disabled or gated outside production.
- Auth UX should not be mistaken for server-side security guarantees.
