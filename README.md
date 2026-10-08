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

- `src/components/` — one folder per section (Navbar, Hero, About, Resume, Projects, Contact, Footer)
- `src/data/` — content (experience, education, projects, profile info) kept separate from markup
- `src/hooks/` — typing effect, scroll-spy active nav section, scroll-reveal animation
