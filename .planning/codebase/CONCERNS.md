# CONCERNS

Date: 2026-07-27

## Reliability concerns

- The app depends on a backend at `http://localhost:3001` for live data.
- Mocked development mode can hide backend integration failures.
- Several key pages are large enough that regressions may be subtle.
- Local storage can desynchronize between tabs or across sessions.
- Route-level lazy loading can complicate debugging of loading states.

## Security concerns

- Client-side auth should not be mistaken for full server enforcement.
- Sanitization is present, but the CSP helper may still be permissive.
- Any use of remote HTML or markdown needs continued scrutiny.
- Analytics and outbound links should remain intentionally scoped.
- Browser storage should never hold secrets.

## Maintainability concerns

- Large feature components may become hard to reason about over time.
- The same filtering logic may be duplicated across pages if not watched.
- API shape drift can affect many screens at once.
- Mocks, tests, and production code must be updated together.
- Styling can drift if primitives are bypassed.

## UX concerns

- Mobile navigation must remain touch-friendly.
- Filter-heavy pages should degrade cleanly on narrow screens.
- Admin surfaces should not leak complexity into public browsing routes.
- Empty states should explain what is missing or unavailable.
- Loading and retry states should stay visible and obvious.

## Delivery concerns

- Build output should always be checked after route or config edits.
- Vite proxy behavior matters for developer experience.
- PWA and manifest changes can affect installability and caching.
- SEO and social metadata need periodic review.
- Any change to auth or analytics should be verified end to end.

## Workflow concerns

- If the backend is absent, frontend verification can look healthier than reality.
- If mocks are stale, tests can become misleading.
- If browser storage is changed manually, state may appear inconsistent.
- If multiple contributors touch the same pages, route regressions can pile up.
- The repository benefits from careful reuse instead of new abstractions by default.

## Immediate recommendations

- Keep using the existing API helpers.
- Keep tests close to the UI paths users actually click.
- Re-run build, lint, and type-check after structural edits.
- Treat security helpers as necessary but not sufficient.
- Prefer incremental changes to the biggest client components.
