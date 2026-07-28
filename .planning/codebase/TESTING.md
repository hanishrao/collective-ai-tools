# TESTING

Date: 2026-07-27

## Test stack

- Vitest is the primary unit and component test runner.
- Testing Library is used for user-facing assertions.
- MSW provides mocked network behavior.
- Playwright is available for browser-level verification.
- Test setup lives in `test/setup.ts`.

## Existing coverage

- Auth context has dedicated tests.
- Library helpers have unit coverage.
- Discover components have component tests.
- Tool card behavior has targeted tests.
- Mock API handlers support many core endpoints.

## Commands

- `pnpm test` runs the main test suite.
- `pnpm test:ui` opens the interactive test UI.
- `pnpm test:coverage` measures coverage.
- `pnpm test:watch` keeps tests running in watch mode.
- `pnpm lint` validates code style.
- `pnpm type-check` validates TypeScript.
- `pnpm build` validates production compilation.

## Recommended test layers

- Unit test pure helpers in `src/lib/`.
- Component test cards, drawers, modals, and filters.
- Integration test auth and data fetching with MSW.
- Browser test the highest-risk routes and admin flows.
- Snapshot only stable, intentionally visual structures.

## Verification priorities

- Navigation should remain usable on mobile and desktop.
- Filters should preserve state when data loads asynchronously.
- Auth flows should fail clearly and recover gracefully.
- Empty states should be deliberate and informative.
- Fallback UI should handle missing backend data.

## Gaps to watch

- There is limited evidence of end-to-end coverage for full user journeys.
- Some of the biggest pages are highly stateful and may regress silently.
- Local storage behavior deserves explicit regression tests.
- API contract drift can slip past if mocks are not kept current.
- Production analytics behavior is probably not covered by tests.

## Good test practice here

- Prefer tests that mirror actual catalog usage.
- Use realistic mocked payloads rather than minimal stubs.
- Assert on visible text, roles, and keyboard affordances.
- Keep route tests focused on the user journey, not internal props.
- Re-run lint and type-check when tests touch shared code.

## CI suggestions

- Run lint, type-check, and unit tests on every change.
- Add Playwright checks for the top routes once available.
- Keep mock handlers in lockstep with the API layer.
- Block merges when build or type-check fails.
- Watch for flaky storage-dependent tests.
