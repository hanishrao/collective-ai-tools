# CONVENTIONS

Date: 2026-07-27

## Code style

- TypeScript is the default language for application logic.
- Prefer explicit types for shared contracts and public helpers.
- Use named exports where existing files already do so.
- Keep imports ordered and grouped consistently.
- Avoid `any` unless a boundary truly demands it.

## React patterns

- Components should be small and focused where possible.
- Page components may own data loading and orchestration.
- Shared presentational pieces should live in reusable folders.
- Use hooks for local state and effects.
- Keep route registration in the app router rather than scattering it.

## Data access

- Use `src/lib/api.ts` instead of direct fetch calls when possible.
- Preserve retry behavior and consistent error normalization.
- Keep API endpoint strings centralized.
- Reuse request parameter shapes instead of ad hoc objects.
- Update mocks alongside API contract changes.

## Styling conventions

- Prefer existing Tailwind utility patterns and shared CSS variables.
- Global rules belong in `src/styles/globals.css`.
- UI primitives should remain visually consistent across pages.
- Do not duplicate button, card, or input styling in feature files.
- Layout components should handle spacing and width constraints.

## Security conventions

- Sanitize rich text before rendering.
- Validate URLs before using them in anchors or navigation.
- Treat local storage as convenience state only.
- Gate analytics or tracking code to production when possible.
- Keep auth client-facing and do not confuse it with hard authorization.

## Testing conventions

- Add or update tests when a utility contract changes.
- Prefer user-visible assertions over implementation details.
- Use MSW for integration-like request behavior.
- Keep test setup centralized in `test/setup.ts`.
- Favor narrow, deterministic tests for component logic.

## Documentation conventions

- Document top-level behavior in markdown near workflow outputs.
- Keep codebase maps factual and path-based.
- Record risks and assumptions explicitly.
- Use the current date when generating workflow artifacts.
- Prefer short sections with practical notes over long prose.

## Change management

- Reuse existing modules before introducing new abstractions.
- Make changes in the smallest file set that solves the problem.
- Update related tests and mocks with code changes.
- Review route changes for impact on navigation and analytics.
- Check build, lint, and test health after structural edits.
