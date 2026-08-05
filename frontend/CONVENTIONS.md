# Frontend conventions

## Component colocation

Each **page** composes a small handful of top-level ("main") components. Each large component is decomposed further into smaller sub-components as it grows.

Every component — large or small — owns its own local folders alongside its component file, rather than reaching into global `hooks/`, `styles/`, etc. directories:

```
components/SystemStatus/
  SystemStatus.tsx       # the component
  hooks/                 # component-local hooks (e.g. useHealthcheck)
  styles/                # component-local CSS modules
  interfaces/            # component-local TS types/interfaces
  data/                  # component-local data-fetching functions
```

Add any other folder a component specifically needs (e.g. `utils/`) using the same pattern. Logic, styling, types, and data-fetching stay next to the component that uses them, so a component can be understood — and deleted — without hunting through global directories.

`components/SystemStatus/` is the reference example: it fetches `GET /api/health` from the backend and renders the result, proving the frontend↔backend↔database path works end to end.

Cross-cutting concerns (design tokens, a shared API client, app-wide layout) live at `src/` top level (e.g. `src/index.css`) rather than inside any one component's local folders — colocation is for component-specific concerns, not app-wide ones.
