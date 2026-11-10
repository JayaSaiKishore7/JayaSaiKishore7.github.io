import react from '@vitejs/plugin-react'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defineConfig } from 'vite'

const themeFile = fileURLToPath(new URL('./src/theme/theme.js', import.meta.url))
const themeCssFile = fileURLToPath(new URL('./src/theme/themeCss.js', import.meta.url))
const headFile = fileURLToPath(new URL('./src/data/head.js', import.meta.url))
const profileFile = fileURLToPath(new URL('./src/data/profile.js', import.meta.url))

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

// Fills <!--app-head--> in index.html with tags built from profile.js (see src/data/head.js).
function siteHead() {
  return {
    name: 'site-head',
    async transformIndexHtml(html, ctx) {
      ctx.server?.watcher.add([headFile, profileFile])
      const [{ headTags }, data] = await Promise.all([load(headFile), load(profileFile)])
      return html.replace('<!--app-head-->', headTags(data))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), themeCss(), siteHead()],
})
