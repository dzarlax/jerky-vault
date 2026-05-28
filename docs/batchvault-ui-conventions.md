# BatchVault UI Conventions

BatchVault is a dense operational app, not an editorial site or marketing page. Prefer compact, stable layouts that support scanning, repeated data entry, and quick comparison.

## CSS Layering

Global styles load in this order:

1. Bootstrap
2. `src/styles/design-system.css` for base tokens
3. `src/styles/components.css` for legacy component definitions
4. `src/styles/batchvault-adapter.css` for BatchVault product-level decisions

Keep new BatchVault-specific visual decisions in the adapter unless a component needs a structural change in TypeScript. Use `components.css` for broad legacy component definitions only.

## Theme And Typography

- Keep the current `data-theme="dark"` theme bridge.
- Use system sans typography for all app headings and controls.
- Do not import editorial serif heading presets into the app shell.
- Keep letter spacing at `0` for normal text. Reserve small caps spacing for compact labels such as table headers and metadata labels.
- Use compact line-height for headings and normal line-height for form/help text.

## App Shell

- Desktop sidebar is fixed-width at 260px.
- Sidebar shell uses flex layout: fixed header, scrollable `.sidebar-nav`, pinned footer.
- Avoid sticky footer positioning inside the sidebar; it caused fragile behavior in earlier passes.
- Mobile sidebar should slide over content and close without leaving the page horizontally scrollable.

## Cards

- Cards use 8-10px radii and restrained shadows.
- Hover movement must be subtle and must not change layout dimensions.
- Dashboard cards should stay stable at mobile, tablet, and wide desktop widths.
- Product and recipe grids should collapse to a single column on narrow mobile.

## Tables

- Keep data tables dense and horizontally scrollable on mobile.
- Use nowrap for operational table headers and numeric values.
- Put table overflow on the table wrapper, not on the page.
- Status and action controls must remain usable at mobile widths.

## Forms And Modals

- Use `SelectDropdown` for dropdowns.
- Modal content should cap at the viewport height.
- Modal body scrolls internally when content is long.
- Modal footer actions must remain reachable on mobile.
- Keep labels explicit, compact, and translated through locale files.

## States

- Use shared loading, empty, error, and notification components instead of page-local state markup.
- Error states should include a retry affordance when the data source can be retried.
- Loading states should avoid layout jumps where a table or card grid is expected.

## Upstream Candidates

These patterns are good candidates for the shared design system after they prove stable in BatchVault:

- Fixed app shell with scrollable nav and pinned footer.
- Dense CRUD table with mobile horizontal scroll.
- CRUD modal with viewport-capped content and scrollable body.
- Operational card grid with restrained hover and stable mobile columns.
- App typography preset for sans dashboard/admin products.
- React-select visual bridge guidance for React apps.
