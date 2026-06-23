# Nutrition Tracker Code Audit

## Project Overview

Two adjacent packages (no workspace root):

- **Root** — React 19 + Vite 8 + Tailwind 4 SPA (single-page dashboard with a `/api/entries` middleware)
- **`mcp-server/`** — Standalone MCP server exposing 5 tools (list/add/update/delete/totals)

Both share a single Supabase project. Each has its own `package.json`, `tsconfig.json`, `node_modules/`.

---

## 1. Correctness / Bugs

| #   | Location                                                    | Issue                                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | `mcp-server/src/server.ts:117-123` & `vite.config.ts:32-36` | `list_food_entries` is documented as "List all food log entries for **today**" but the query is an unfiltered `SELECT * ORDER BY created_at` — returns every row ever, not today. Same in the Vite middleware.                                                                                                                                                                                                 |
| 1.2 | `Dashboard.tsx:80`                                          | Static text `"2,800–3,200 kcal • 120–170g protein • ~250g carbs • ≤400mg caffeine"` is hardcoded; the actual goals are 3000/150/250/400. Changing `calGoal`/`proGoal` does **not** update the displayed range — silent drift.                                                                                                                                                                                  |
| 1.3 | `FoodLogSection.tsx:32-37`                                  | `addEntry` silently `return`s when name/cal/protein are invalid — no user-visible error, just a no-op (and the modal stays open with no feedback). Compare to the explicit `setFormError` path on line 56.                                                                                                                                                                                                     |
| 1.4 | `entries.ts:31-39` & `vite.config.ts:39-69`                 | `addEntry` accepts negative numbers for calories/protein/carbs/caffeine — no validation. `Math.round(-100) = -100` is happily inserted.                                                                                                                                                                                                                                                                        |
| 1.5 | `vite.config.ts:39-69` & `mcp-server/src/server.ts:125-145` | Both endpoints generate the `id` client-side with `crypto.randomUUID()`. The DB likely defaults to `gen_random_uuid()` — fine, but if the schema already requires `id` in the `Insert` type (line 37: `id: string` is required, not optional), then on a malformed input the supabase-js client could complain about a type mismatch. The `Insert` type should make `id` optional so the DB default can apply. |
| 1.6 | `vite.config.ts:13`                                         | Supabase URL `https://vqfgprypqcplfceigwur.supabase.co` is hardcoded in the file; the URL also appears in `mcp-server/.env.example`. Two sources of truth.                                                                                                                                                                                                                                                     |
| 1.7 | `mcp-server/src/server.ts:166`                              | `if (!data) throw new Error(...)` — Supabase `.single()` distinguishes "not found" via error code `PGRST116`, so the error message is misleading; rely on the error from `.single()` instead.                                                                                                                                                                                                                  |
| 1.8 | `FoodLogSection.tsx:78-80`                                  | `avgProtein`/`highestProtein`/`avgCalPerItem` are computed unconditionally but rendered only when `entries.length > 0`. The variables are typed `FoodEntry` via `!` non-null assertions at lines 228-229 — relies on a render-time invariant the compiler can't verify.                                                                                                                                        |

## 2. Redundancy / DRY Violations

| #    | Locations                                                                                                            | Issue                                                                                                                                                                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1  | `src/lib/database.ts` (70 lines) ↔ `mcp-server/src/database.ts` (52 lines)                                          | The `Database` type is hand-duplicated, character-for-character. The two files will drift the moment the schema changes.                                                                                                                                |
| 2.2  | `src/lib/entries.ts:9-22` ↔ `mcp-server/src/server.ts:27-40`                                                        | Identical `mapRow` function in two places.                                                                                                                                                                                                              |
| 2.3  | `src/lib/entries.ts:46-55` ↔ `mcp-server/src/server.ts:180-188`                                                     | Two implementations of the totals reducer.                                                                                                                                                                                                              |
| 2.4  | `src/lib/database.ts:14-17` ↔ `mcp-server/src/server.ts:25`                                                         | Goals constant duplicated (`{calGoal: 3000, proGoal: 150, carbGoal: 250, caffeineGoal: 400}`).                                                                                                                                                          |
| 2.5  | `FoodLogSection.tsx:4-15` ↔ `vite.config.ts:54-56` ↔ `mcp-server/src/server.ts:134-136` ↔ `add_food_entry` schema | The set of allowed icon classes and their default colors is defined/referenced in four places.                                                                                                                                                          |
| 2.6  | `Dashboard.tsx:84-237`                                                                                               | Four near-identical "metric card" blocks (~40 lines each) — should be a single `<MetricCard>` component taking props for `label`, `value`, `unit`, `goal`, `color`, `icon`.                                                                             |
| 2.7  | `src/assets/hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`                                                   | Vite template boilerplate; `icons.svg` contains an unused `bluesky-icon` symbol. None are imported anywhere.                                                                                                                                            |
| 2.8  | `entries.ts:3`                                                                                                       | `export { calGoal, proGoal, carbGoal, caffeineGoal } from './database'` — re-export chain adds an indirection; consumers could import from `database` directly. The `entries.ts` file re-exports `FoodEntry` and the goals; mixing types and constants. |
| 2.9  | `App.tsx:3-19`                                                                                                       | `Layout` is a private component inside `App.tsx` while `FoodLogSection` lives under `components/`. Inconsistent organization.                                                                                                                           |
| 2.10 | `FoodLogSection.tsx:74-77`                                                                                           | Local `totals` reduce for calories+protein only, despite `sumTotals` existing in `entries.ts`. The Dashboard computes totals; the section re-computes its own subset.                                                                                   |

## 3. Industry-Standard Structure

| #    | Issue                                                                                                                                                        | Recommendation                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1  | No monorepo tooling. Two packages installed independently (`node_modules` in root and `mcp-server/`), two lockfiles, two `tsconfig`s, no workspace manifest. | Convert to a pnpm/npm/yarn workspace, add root `package.json` with `"workspaces"`. Single lockfile, hoisted deps.                                  |
| 3.2  | No shared `types/` or `packages/shared/` package. The `Database` type belongs in a shared package consumed by both `src/` and `mcp-server/`.                 | Extract `database.ts` (and `mapRow`, `sumTotals`, `iconOptions`, `goals`) into `packages/shared` or a `src/shared/` importable from both packages. |
| 3.3  | `mcp-server/` has no `tsconfig.node.json` split — uses a single `tsconfig.json`. Root has the modern split. Inconsistent.                                    | Align on the same TS project-references setup.                                                                                                     |
| 3.4  | `package.json` root has `"typescript": "~6.0.2"`; mcp-server has `"typescript": "~5.7.0"`. Different TS versions in the same repo.                           | Pin to a single version.                                                                                                                           |
| 3.5  | `package.json` root is missing `engines`, `private: true` is set but no `name` consistency with `mcp-server/package.json`.                                   | Add `engines` and consistent metadata.                                                                                                             |
| 3.6  | No test runner, no test scripts, no `vitest`/`jest` config.                                                                                                  | Add `vitest` (matches Vite stack), wire `npm test` and CI.                                                                                         |
| 3.7  | `README.md` is the unmodified Vite template — never describes the project.                                                                                   | Replace with a real README: stack, setup, env vars, scripts, architecture.                                                                         |
| 3.8  | No `.editorconfig`, no `prettier`, no `prettier` script, no `format` npm script.                                                                             | Add Prettier + `.editorconfig`.                                                                                                                    |
| 3.9  | No CI config (`.github/workflows`).                                                                                                                          | Add a minimal CI: install, typecheck, lint, test, build.                                                                                           |
| 3.10 | Vite plugin reads `mcp-server/.env` directly — root Vite config is coupled to the mcp-server's filesystem layout.                                            | Move shared env to a root `.env`; let mcp-server read its own.                                                                                     |

## 4. Security

| #   | Issue                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Recommendation                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | `vite.config.ts:20-25` instantiates a Supabase client with the **`service_role` key** inside the Vite dev server middleware. The middleware is `apply: 'serve'` only, so production builds are unaffected, but anyone running `npm run dev` exposes full DB read/write via `/api/entries` to any browser hitting localhost. The service-role key also never goes to the client (Vite middleware runs server-side), so this is contained — but it's still a footgun: there's no auth at all. | Add at minimum an `X-Internal-Token` check; long term, move the API to a separate serverless function or a Node service and remove the Vite middleware entirely. |
| 4.2 | No CORS / origin checks on the middleware.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Add an origin allowlist.                                                                                                                                         |
| 4.3 | `mcp-server` uses `SUPABASE_SERVICE_ROLE_KEY` — appropriate for an MCP server, but there are no per-user RLS policies referenced anywhere; the server can read/write everything.                                                                                                                                                                                                                                                                                                            | Document and add RLS policies to `food_entries`.                                                                                                                 |
| 4.4 | `.env` files are properly ignored (`.gitignore` line 14), but there is no `.env.example` at the root for the Vite dev setup.                                                                                                                                                                                                                                                                                                                                                                | Add root `.env.example`.                                                                                                                                         |

## 5. Accessibility / UX

| #   | Location                     | Issue                                                                                                                                   |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | `FoodLogSection.tsx:281-340` | Form labels are not associated to inputs (`<label>` lacks `htmlFor`; inputs lack `id`).                                                 |
| 5.2 | `FoodLogSection.tsx:265-277` | Icon-selection buttons have no `aria-label`; the trash button at line 202-209 has `title` but no `aria-label`.                          |
| 5.3 | `FoodLogSection.tsx:244-360` | Modal has no `role="dialog"`, `aria-modal`, no focus trap, no Escape-to-close.                                                          |
| 5.4 | `FoodLogSection.tsx:74-80`   | `Math.round` on `(totals.protein / entries.length).toFixed(1)` is computed on every render — fine for small N but trivially memoizable. |
| 5.5 | `Dashboard.tsx:42-49`        | Loading state shows a spinner but no `aria-busy` / `aria-live`.                                                                         |

## 6. Misc / Style

| #   | Location                                                                                                                                                                                                             | Issue                                                                                                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 | `Dashboard.tsx:32-40`                                                                                                                                                                                                | `useCallback` for `persistAdd`/`persistDelete` is unnecessary — they're not dependencies of any effect or memoized child.                                                                                            |
| 6.2 | `FoodLogSection.tsx:8` vs `Dashboard.tsx:204`                                                                                                                                                                        | `fa-mug-hot` is colored pink in the food log but purple in the caffeine card. Inconsistent icon-color semantics.                                                                                                     |
| 6.3 | `vite.config.ts:91-92`                                                                                                                                                                                               | `[['name','name'], ...]` — entries where the JS and DB keys are identical could be a simple `Object.entries({ ..., iconBg: 'icon_bg', iconColor: 'icon_color' })`.                                                   |
| 6.4 | `mcp-server/src/server.ts:104`                                                                                                                                                                                       | `version: '1.0.0'` is hardcoded in the server constructor but the package version is also `1.0.0` — should be `import { version } from '../package.json' assert { type: 'json' }` (or use a build-time replacement). |
| 6.5 | `FoodLogSection.tsx:32-60`                                                                                                                                                                                           | The form state is a single object with all string fields — fine, but a discriminated union or per-field state with zod parsing would catch invalid input before submit.                                              |
| 6.6 | `entries.ts:31-39`                                                                                                                                                                                                   | No retry/backoff on transient network errors.                                                                                                                                                                        |
| 6.7 | Root `index.css` is a single line: `@import "tailwindcss";`. Tailwind v4 is installed and configured but barely used (only `min-h-screen` and `max-w-4xl` in `App.tsx`). The codebase is dominated by inline styles. | Migrate inline styles to Tailwind classes (Tailwind 4 is already configured) or to CSS modules.                                                                                                                      |
| 6.8 | `tsconfig.app.json` enables `erasableSyntaxOnly` — fine, but no `"strict": true`. `noUnusedLocals`/`noUnusedParameters` are on; `strictNullChecks` etc. are not.                                                     | Enable full `strict: true`.                                                                                                                                                                                          |

---

## Proposed Plan (in priority order)

### Phase 1 — Correctness (must fix)

1. Add a real "today" filter to `list_food_entries` and the Vite `GET /api/entries` (probably a `created_at::date = current_date` clause, or a `entry_date` column).
2. Derive the "Today's Intake" target text from the actual goal constants instead of hardcoding the range.
3. Surface validation errors in `FoodLogSection.addEntry` (currently silent no-op on bad input).
4. Validate non-negative numbers in both `addEntry` paths (UI + Vite middleware + MCP).
5. Make `id` optional in the `Database` `Insert` type so the DB default can apply (or always generate UUIDs in one place — pick one).

### Phase 2 — Remove redundancy

6. Create a shared package (or simple `src/shared/` imported via relative path from `mcp-server/src/`) containing: `Database` type, `mapRow`, `sumTotals`, `goals`, `iconOptions`, `FoodEntry`. Both packages import from it.
7. Extract `<MetricCard>` in `Dashboard.tsx`; collapse 4 ~40-line blocks into a map.
8. Move `Layout` out of `App.tsx` into `src/components/Layout.tsx`.
9. Delete unused `src/assets/*` and `public/icons.svg`.

### Phase 3 — Industry-standard structure

10. Convert to a workspace (single lockfile, hoisted deps).
11. Pin a single TypeScript version.
12. Replace `README.md` with project documentation.
13. Add `prettier`, `format` script, `.editorconfig`.
14. Add `vitest` + a couple of unit tests for `mapRow`, `sumTotals`, and the totals reducer on the server side.
15. Enable `strict: true` in `tsconfig.app.json`; fix any fallout.

### Phase 4 — Security & accessibility

16. Add an internal token check on the Vite `/api/entries` middleware; document the production path.
17. Add `.env.example` at the root.
18. Wire `htmlFor`/`id`, `aria-label`, `role="dialog"`, Escape handler on the modal.

### Phase 5 — Cleanup

19. Remove `useCallback` where unneeded.
20. Replace inline styles with Tailwind classes (optional, big diff).
21. Remove the unused `react-router-dom` dependency (no `<Router>`/`Routes` exist in the codebase).

---

## Open Questions

**Q1.** Should the monorepo conversion be a true workspace migration (single lockfile, hoisted deps, packages layout), or keep the two `package.json`s as-is and share code via a relative import? The latter is a smaller diff; the former is more "industry standard" but more invasive.

**Q2.** For the "today" filter (#1) — does the schema have an `entry_date` column, or should the filter use `created_at::date = current_date`? If the former, that requires a DB migration that cannot be verified from this repo alone.

**Q3.** Is removing the unused `react-router-dom` dependency and the three leftover Vite-template assets in scope, or should those be left alone?
