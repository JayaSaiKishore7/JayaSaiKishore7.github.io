# Jaya Sai Kishore — Portfolio

Personal portfolio site built with React + Vite.

**Live: https://jayasaikishore.pages.dev/**

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

Every page ships real HTML (`scripts/prerender.mjs` + `src/entry-server.jsx`), so link previews,
search engines and tools that don't run JavaScript see the full content: the home page at
`dist/index.html` and one case study per project at `dist/work/<id>/index.html`, each with its own
`<head>` tags, plus `dist/sitemap.xml`. In the browser, React takes over a page only when its HTML
was rendered for that path (`data-path` on `#root`, checked in `src/main.jsx`).

## Architecture diagrams

A project with an `architecture` entry in `src/data/projects.js` (nodes on a grid, edges, groups)
gets an interactive diagram on its case study page (`src/components/ArchitectureDiagram/`): hovering
or tabbing to a step highlights its connections and shows its description. To add one for another
project, add the data; no new code is needed.

## Pages

`src/routes.js` maps paths to pages, with no router library: `/` is the home page, and `/work/<id>/`
is a project's case study (`src/components/CaseStudy/`). `App` receives the path and renders the
matching page.

## Screenshots and link preview

Both use the Microsoft Edge installed on the machine (`playwright-core`, no browser download), with
`npm run dev` running:

```bash
npm run screens -- <outDir>   # phone, laptop and wide shots at several scroll points, plus a
                              # report of the active nav section and any horizontal overflow
npm run og-image              # regenerates public/og-image.png (link-preview image) from the hero
```

## Deployment

The site is hosted on **Cloudflare Pages** (free) at https://jayasaikishore.pages.dev/, in the
`jayasaikishore` Pages project. Deploys are uploaded from this machine, not built from Git:

```bash
npx wrangler login   # once per machine; opens the browser to sign in to Cloudflare
npm run deploy       # guard, lint, build, upload dist/ to Cloudflare Pages, then smoke-test the live site
```

`npm run deploy` runs, stopping at the first failure:

1. `scripts/predeploy.mjs` refuses to deploy unless you're on `main`, nothing is uncommitted, and
   `main` isn't behind `origin/main`. So the commit Cloudflare records is exactly what went live.
2. `oxlint`, then the full build.
3. `wrangler pages deploy` (wrangler is pinned in `devDependencies`). A failed upload leaves the
   previous deployment live.
4. `scripts/smoke.mjs --expect-dist` waits until the live home page matches the `dist/` just built,
   then checks every page in Edge: pre-rendered HTML, the app starts, no console errors or failed
   requests, no sideways scrolling at phone and laptop widths, all four case study points, plus
   the sitemap, robots.txt and the resume PDF. If it fails, the new version **is** live: roll back
   (below) or fix and deploy again.

Run the smoke test on its own against any copy of the site:

```bash
npm run smoke                                      # production
npm run build && npm run preview                   # then, in another terminal:
npm run smoke -- http://localhost:4173/            # the local build, before deploying
```

### Rolling back

- **Fastest:** Cloudflare dashboard → Workers & Pages → `jayasaikishore` → Deployments → pick the
  last good one → *Rollback to this deployment*. Every deployment keeps its own URL
  (`https://<id>.jayasaikishore.pages.dev`), so check it there first (`npm run smoke -- <that url>`).
  `npx wrangler pages deployment list --project-name jayasaikishore` lists them with their commits.
- **From git:** `git switch --detach <good commit>`, `npm run build`,
  `npx wrangler pages deploy dist --project-name jayasaikishore --branch main`, then
  `git switch main` and fix forward. (This bypasses the guard on purpose; it's for emergencies.)

Pushing to GitHub does **not** update the live site; run `npm run deploy` after merging. The site's
own address (canonical links, Open Graph, sitemap) comes from `siteUrl` in `src/data/profile.js`,
and `public/robots.txt` names the sitemap URL. Update both if the domain changes.

`.github/workflows/deploy.yml` publishes to GitHub Pages (the previous hosting at
`jayasaikishore7.github.io`). It now runs only when started by hand, so pushes to `main` can't
publish a second copy of the site; restore its `push` trigger when moving back to GitHub Pages.

## Structures

- `src/components/` — one class component per section, in page order: Navbar, Hero, Projects (`#work`), Resume (`#experience`), About (`#about`, with a `#hello` alias for old links), Education (a 3D coverflow carousel), ContactCard (`#contact`, the page footer on every page: the "inference terminal" contact card with the `TrainingLog` loss curve and the © line). Projects shows every project in `ProjectSplit/` (a list plus a sticky, crossfading preview; an accordion on phones); `CaseStudy/` is the per-project page; `Project/` holds the pieces both use (`ProjectThumb`, `TechList`). `Reveal.jsx` is the shared scroll-in wrapper. `SectionLabel.jsx` renders the "01 · work" labels, numbered from `src/data/nav.js`.
- `src/index.css` — base styles and shared building blocks: `.container` and `.section*`.
- `src/data/` — content (profile, nav, projects, experience and education) kept separate from markup. `projects.js` documents each project's fields: one-line `what`, `tech`, `thumbnail` (a 960×600 WebP in `public/projects/`, or `null` to draw one from the code fragment), `demo`, and the case-study notes. Skills are grouped in `profile.js` (`skillGroups`). `nav.js` sets the section order for both the navbar and the section labels. `head.js` builds the page's `<head>` tags (title, description, Open Graph, JSON-LD) from `profile.js`.
- `src/theme/theme.js` — the design tokens (colors, fonts, radius, spacing, easing). `themeCss.js` turns them into a `:root` block at build time, served as `virtual:theme.css` by a plugin in `vite.config.js`, so the colors are in the first stylesheet (no white flash). Stylesheets use these variables; a few one-off values (such as the faint white card gradients) are still written inline.
- Fonts are self-hosted from `@fontsource` packages (imported in `src/main.jsx`); nothing is loaded from Google.
- `src/utils/` — framework-agnostic helper classes owned by component lifecycle methods instead of hooks: `DetectionBoxes`, `NmsReveal`, `ScrollSpy`, `Clock`, `Magnetic`

## UI states

Each stateful piece has a small set of named states, visible in the DOM for tests, tooling and CSS:

| Where | States | Exposed as |
| --- | --- | --- |
| Page boot (`index.html` + `App`) | `.js` on `<html>` while scripts run, which enables the hidden "before reveal" styles. `data-app="ready"` once React has mounted. If the app hasn't mounted within 4 s, `.js` is removed and all content stays visible. | `html.js`, `html[data-app]` |
| Nav active section (`ScrollSpy`, owned by `App`) | `null` on the hero, then one of the nav section ids. At the page bottom the last section wins. | `aria-current="location"` on the active navbar link |
| Scroll reveal (`Reveal`) | hidden → visible (one way). On cards, `Reveal` wraps the card in a `.card-slot`, so scroll-in and hover motion stay separate. | `.reveal.is-visible`. Print shows everything. |
| Architecture diagram (`ArchitectureDiagram`) | `none` ↔ a step id (hover or keyboard focus) | `.arch[data-active]`, caption announced through `aria-live` |
| Project split view (`ProjectSplit`) | `active`: selected project on desktop / centred card in the phone gallery. Hover (after 80 ms), focus or click selects; ArrowUp/ArrowDown move and wrap. `isMobile` (under 900px, matchMedia) turns auto-play off; CSS picks the layout. `paused` (pointer over or focus inside) stops auto-play, which also stops when the tab is hidden, the section is off screen or reduced motion is on. Auto-play advances every 5 s (requestAnimationFrame). | `aria-pressed` on the selected list button; inactive previews are `aria-hidden` and `inert`; phone counter is `aria-live` |