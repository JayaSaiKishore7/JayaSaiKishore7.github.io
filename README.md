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

## Structure

- `src/components/` — one class component per section (Navbar, Hero, About, Resume, Projects, Contact, Footer)
- `src/data/` — content (experience, education, projects, profile info) kept separate from markup
- `src/theme/theme.js` — the single source of truth for every color, font, radius, shadow, and spacing value. `ThemeInjector.js` writes it onto `:root` as CSS custom properties at startup; no component or `.css` file hardcodes a style value.
- `src/utils/` — framework-agnostic OOP helper classes (`TypingAnimator`, `ScrollSpy`) owned by component lifecycle methods instead of hooks
