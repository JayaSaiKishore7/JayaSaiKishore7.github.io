import react from '@vitejs/plugin-react'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defineConfig } from 'vite'
import { fetchGithub, summarizeGithub } from './src/data/github.js'

const themeFile = fileURLToPath(new URL('./src/theme/theme.js', import.meta.url))
const themeCssFile = fileURLToPath(new URL('./src/theme/themeCss.js', import.meta.url))
const headFile = fileURLToPath(new URL('./src/data/head.js', import.meta.url))
const profileFile = fileURLToPath(new URL('./src/data/profile.js', import.meta.url))
const projectsFile = fileURLToPath(new URL('./src/data/projects.js', import.meta.url))

// Fresh import on every call, so edits to these data files apply without a restart.
const load = (file) => import(`${pathToFileURL(file).href}?t=${Date.now()}`)

// Serves theme.js as the CSS module "virtual:theme.css" (see src/theme/themeCss.js).
function themeCss() {
  const id = 'virtual:theme.css'
  const resolved = `\0${id}`
  return {
    name: 'theme-css',
    resolveId: (source) => (source === id ? resolved : undefined),
    async load(source) {
      if (source !== resolved) return undefined
      this.addWatchFile(themeFile)
      this.addWatchFile(themeCssFile)
      const [{ theme }, { themeToCss }] = await Promise.all([load(themeFile), load(themeCssFile)])
      return themeToCss(theme)
    },
  }
}

// Fills <!--app-head--> in index.html with the page's tags (see src/data/head.js).
// In dev that's the requested page; in a build it's the home page, and
// scripts/prerender.mjs then swaps in each page's own tags.
function siteHead() {
  return {
    name: 'site-head',
    async transformIndexHtml(html, ctx) {
      ctx.server?.watcher.add([headFile, profileFile, projectsFile])
      const [{ headTags }, { profile, seo }, { projects }] = await Promise.all([
        load(headFile),
        load(profileFile),
        load(projectsFile),
      ])
      const path = ctx.server ? (ctx.originalUrl ?? '/').split(/[?#]/)[0] : '/'
      return html.replace('<!--app-head-->', headTags({ profile, seo, projects, path }))
    },
  }
}

// Serves the GitHub activity summary as "virtual:github-activity" (see src/data/github.js).
// Fetched once at build time and cached for 15 minutes, so the client and the
// pre-render builds see the same data. On any failure it exports null and the
// section is left out; a GitHub outage never breaks the build.
function githubActivity() {
  const id = 'virtual:github-activity'
  const resolved = `\0${id}`
  const cacheFile = fileURLToPath(new URL('./node_modules/.cache/github-activity.json', import.meta.url))
  const maxAgeMs = 15 * 60 * 1000

  async function summary() {
    try {
      const cached = JSON.parse(await readFile(cacheFile, 'utf8'))
      if (Date.now() - new Date(cached.asOf).getTime() < maxAgeMs) return cached
    } catch {
      // no usable cache
    }
    try {
      const data = summarizeGithub(await fetchGithub({ token: process.env.GITHUB_TOKEN }))
      await mkdir(dirname(cacheFile), { recursive: true })
      await writeFile(cacheFile, JSON.stringify(data))
      return data
    } catch (error) {
      console.warn(`[github-activity] skipped: ${error.message}`)
      return null
    }
  }

  return {
    name: 'github-activity',
    resolveId: (source) => (source === id ? resolved : undefined),
    async load(source) {
      if (source !== resolved) return undefined
      return `export default ${JSON.stringify(await summary())};`
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), themeCss(), siteHead(), githubActivity()],
})
