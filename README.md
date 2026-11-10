# Jaya Sai Kishore — Portfolio

Personal portfolio site built with React + Vite.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # client build, then a server build that pre-renders the page into dist/index.html
npm run preview
```

The built page ships real HTML (`scripts/prerender.mjs` + `src/entry-server.jsx`), so link previews,
search engines and tools that don't run JavaScript see the full content. In the browser, React takes
the page over (`hydrateRoot` in `src/main.jsx`).

## Screenshots and link preview

Both use the Microsoft Edge installed on the machine (`playwright-core`, no browser download), with
`npm run dev` running:

```bash
npm run screens -- <outDir>   # phone, laptop and wide shots at several scroll points, plus a
                              # report of the active nav section and any horizontal overflow
npm run og-image              # regenerates public/og-image.png (link-preview image) from the hero
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the site and publishes
it to GitHub Pages. In the repo settings, **Settings → Pages → Source** must be set to
**GitHub Actions** for this to take effect.

## Structures

- `src/components/` — one class component per section, in page order: Navbar, SideNav (the hook-rail section nav on wide screens, which replaces the top bar's links there), Hero, Projects (`#work`), Resume (`#experience`), Education, Contact (`#hello`, the about section), Connect (`#contact`), Footer. `Reveal.jsx` is the shared scroll-in wrapper. `SectionLabel.jsx` renders the "01 · work" labels, numbered from `src/data/nav.js`.
- `src/index.css` — base styles and shared building blocks: `.container`, `.section*`, and the `.card` / `.card--lift` surface used by the project, experience and education cards
- `src/data/` — content (profile, nav, projects, experience and education) kept separate from markup. `nav.js` sets the section order for both the navbar and the section labels. `head.js` builds the page's `<head>` tags (title, description, Open Graph, JSON-LD) from `profile.js`.
- `src/theme/theme.js` — the design tokens (colors, fonts, radius, spacing, easing). `themeCss.js` turns them into a `:root` block at build time, served as `virtual:theme.css` by a plugin in `vite.config.js`, so the colors are in the first stylesheet (no white flash). Stylesheets use these variables; a few one-off values (such as the heatmap colors in `Projects.css`) are still written inline.
- Fonts are self-hosted from `@fontsource` packages (imported in `src/main.jsx`); nothing is loaded from Google.
- `src/utils/` — framework-agnostic helper classes owned by component lifecycle methods instead of hooks: `BootSequence`, `DetectionBoxes`, `NmsReveal`, `ScrollSpy`, `Clock`, `PointerGlow`, `Tilt3D`

## UI states

Each stateful piece has a small set of named states, visible in the DOM for tests, tooling and CSS:

| Where | States | Exposed as |
| --- | --- | --- |
| Page boot (`index.html` + `App`) | `.js` on `<html>` while scripts run, which enables the hidden "before reveal" styles. `data-app="ready"` once React has mounted. If the app hasn't mounted within 4 s, `.js` is removed and all content stays visible. | `html.js`, `html[data-app]` |
| Hero intro (`BootSequence` + `Hero`) | `booting` → `ready`. The terminal intro plays once per session, and any key, click, wheel or touch skips it. | `#home[data-phase]` |
| Copy-email button (`Connect`) | `idle` → `copied` or `failed` → `idle` | `.copy[data-state]`, announced through `aria-live` |
| Nav active section (`ScrollSpy`, owned by `App`) | `null` on the hero, then one of the nav section ids. At the page bottom the last section wins. It feeds both the top bar and the side nav. | `aria-current="location"` on the active link |
| Side nav hover (`SideNav`, screens ≥ 1480px) | `idle` ↔ `hovering` (pointer or keyboard focus on an item other than the active one) | `.side-nav-list[data-state]` |
| Scroll reveal (`Reveal`) | hidden → visible (one way). On cards, `Reveal` wraps the card in a `.card-slot`, so scroll-in and hover motion stay separate. | `.reveal.is-visible`. Print shows everything. |
| 3D tilt (`Tilt3D`, lead project card) | resting ↔ tilting. Off on touch-only devices and with reduced motion. | `.card--tilt.is-tilting`, with `--tilt-x`/`--tilt-y` |