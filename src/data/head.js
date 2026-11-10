const escape = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The page's <head> tags (title, description, link previews, structured data),
 * built from profile.js's `profile` and `seo` so they can't drift from the
 * site's content. A pure function: the head plugin in vite.config.js loads
 * profile.js fresh and passes it in, in dev and in builds.
 */
export function headTags({ profile, seo }) {
  const image = new URL(seo.image, profile.siteUrl).href;

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: seo.jobTitle,
    url: profile.siteUrl,
    image,
    address: { "@type": "PostalAddress", addressLocality: profile.city, addressCountry: "FR" },
    sameAs: [profile.github, profile.linkedin],
  };

  return [
    `<title>${escape(seo.title)}</title>`,
    `<meta name="description" content="${escape(seo.description)}" />`,
    `<link rel="canonical" href="${escape(profile.siteUrl)}" />`,
    `<meta name="theme-color" content="${escape(seo.themeColor)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:title" content="${escape(seo.title)}" />`,
    `<meta property="og:description" content="${escape(seo.description)}" />`,
    `<meta property="og:url" content="${escape(profile.siteUrl)}" />`,
    `<meta property="og:image" content="${escape(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, "\\u003c")}</script>`,
  ].join("\n    ");
}
