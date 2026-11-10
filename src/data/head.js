import { resolveRoute } from "../routes.js";

const escape = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

// Marks the generated block, so scripts/prerender.mjs can swap it per page.
export const HEAD_START = "<!--head:start-->";
export const HEAD_END = "<!--head:end-->";

/**
 * The <head> tags (title, description, link previews, structured data) for
 * the page at `path`, built from the site's data so they can't drift from its
 * content. A pure function: callers pass the data in (vite.config.js loads it
 * fresh in dev; the pre-render step uses the bundled copy).
 */
export function headTags({ profile, seo, projects, theme, path = "/" }) {
  const route = resolveRoute(path, projects);
  const url = new URL(path, profile.siteUrl).href;

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: seo.jobTitle,
    url: profile.siteUrl,
    address: { "@type": "PostalAddress", addressLocality: profile.city, addressCountry: "FR" },
    sameAs: [profile.github, profile.linkedin],
  };

  let page;
  if (route.page === "case-study") {
    const { project } = route;
    page = {
      title: `${project.title} | ${profile.fullName}`,
      description: `${project.what} ${project.proof}`,
      image: project.thumbnail?.src ?? seo.image,
      imageSize: project.thumbnail ? [960, 600] : [1200, 630],
      type: "article",
      data: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description: project.what,
        url,
        codeRepository: project.link,
        author: { "@type": "Person", name: profile.fullName, url: profile.siteUrl },
      },
    };
  } else {
    page = {
      title: seo.title,
      description: seo.description,
      image: seo.image,
      imageSize: [1200, 630],
      type: "profile",
      data: { ...person, image: new URL(seo.image, profile.siteUrl).href },
    };
  }

  const image = new URL(page.image, profile.siteUrl).href;

  const tags = [
    `<title>${escape(page.title)}</title>`,
    `<meta name="description" content="${escape(page.description)}" />`,
    `<link rel="canonical" href="${escape(url)}" />`,
    // Browser UI colour, following the light/dark theme tokens.
    `<meta name="theme-color" media="(prefers-color-scheme: light)" content="${escape(theme.colors.light.bg)}" />`,
    `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${escape(theme.colors.dark.bg)}" />`,
    `<meta property="og:type" content="${page.type}" />`,
    `<meta property="og:title" content="${escape(page.title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    `<meta property="og:url" content="${escape(url)}" />`,
    `<meta property="og:image" content="${escape(image)}" />`,
    `<meta property="og:image:width" content="${page.imageSize[0]}" />`,
    `<meta property="og:image:height" content="${page.imageSize[1]}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    jsonLd(page.data),
  ];

  return [HEAD_START, ...tags, HEAD_END].join("\n    ");
}
