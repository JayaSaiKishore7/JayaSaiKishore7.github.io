# Jaya Sai Kishore — Portfolio

Personal portfolio site built with React + Vite.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the site and publishes
it to GitHub Pages. In the repo settings, **Settings → Pages → Source** must be set to
**GitHub Actions** for this to take effect.

## Structures

- `src/components/` — one class component per section, in page order: Navbar, Hero, Projects (`#work`), Resume (`#experience`), Education, Contact (`#hello`, the about section), Connect (`#contact`), Footer. `Reveal.jsx` is the shared scroll-in wrapper. `SectionLabel.jsx` renders the "01 · work" labels, numbered from `src/data/nav.js`.
- `src/index.css` — base styles and shared building blocks: `.container`, `.section*`, and the `.card` / `.card--lift` surface used by the project, experience and education cards
- `src/data/` — content (profile, nav, projects, experience and education) kept separate from markup. `nav.js` sets the section order for both the navbar and the section labels.
- `src/theme/theme.js` — the design tokens (colors, fonts, radius, spacing, easing). `ThemeInjector.js` writes them onto `:root` as CSS custom properties at startup. Stylesheets use these variables; a few one-off values (such as the heatmap colors in `Projects.css`) are still written inline.
- `src/utils/` — framework-agnostic helper classes owned by component lifecycle methods instead of hooks: `BootSequence`, `DetectionBoxes`, `NmsReveal`, `ScrollSpy`, `Clock`, `PointerGlow`, `Tilt3D`

## UI states

Each stateful piece has a small set of named states, visible in the DOM for tests, tooling and CSS:

| Where | States | Exposed as |
| --- | --- | --- |
| Hero intro (`BootSequence` + `Hero`) | `booting` → `ready`. The terminal intro plays once per session, and any key, click, wheel or touch skips it. | `#home[data-phase]` |
| Copy-email button (`Connect`) | `idle` → `copied` or `failed` → `idle` | `.copy[data-state]`, announced through `aria-live` |
| Nav active section (`ScrollSpy`) | one of the nav section ids | `aria-current="location"` on the active link |
| Scroll reveal (`Reveal`) | hidden → visible (one way). On cards, `Reveal` wraps the card in a `.card-slot`, so scroll-in and hover motion stay separate. | `.reveal.is-visible`. Print shows everything. |
| 3D tilt (`Tilt3D`, lead project card) | resting ↔ tilting. Off on touch-only devices and with reduced motion. | `.card--tilt.is-tilting`, with `--tilt-x`/`--tilt-y` |