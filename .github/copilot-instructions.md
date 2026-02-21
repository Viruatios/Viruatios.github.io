# Copilot instructions

## Project overview

- Astro site with React integration for islands; main pages live in [src/pages/](src/pages/).
- Blog content uses Astro content collections from markdown in [src/blog/](src/blog/) with schema in [src/content.config.ts](src/content.config.ts).
- Blog routes are generated in [src/pages/posts/[...slug].astro](src/pages/posts/[...slug].astro) via `getCollection()` and `render()`.
- Tag index and tag detail pages are in [src/pages/tags/index.astro](src/pages/tags/index.astro) and [src/pages/tags/[tag].astro](src/pages/tags/[tag].astro).
- Layouts are centralized in [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) and [src/layouts/MarkDownPostLayout.astro](src/layouts/MarkDownPostLayout.astro).

## Key patterns to follow

- New blog posts must live in [src/blog/](src/blog/) and include frontmatter fields: `title`, `pubDate`, `description`, `author`, `image` (with `url` and `alt`), and `tags` (see [src/content.config.ts](src/content.config.ts)).
- Use `BaseLayout` for regular pages and `MarkDownPostLayout` for markdown posts to keep consistent header/footer and metadata rendering.
- Interactive client code uses Astro islands; see `Greeting` React island in [src/components/Greeting.jsx](src/components/Greeting.jsx) and its usage with `client:load` in [src/pages/index.astro](src/pages/index.astro).
- Site-wide styles live in [src/styles/global.css](src/styles/global.css); header/nav responsiveness is driven by `.menu` and `.nav-links` plus [src/scripts/menu.js](src/scripts/menu.js).
- Theme toggle relies on the `dark` class on `html` (see [src/components/ThemeIcon.astro](src/components/ThemeIcon.astro) and dark styles in [src/styles/global.css](src/styles/global.css)).

## Consistency rules

- Match existing code style before adding or editing. Use the nearest file as the style source (spacing, comments, naming, and string quotes).
- Prefer editing or extending existing structures over creating new ones when the feature already exists. Reuse components and pages instead of duplicating.
- If you must add a new file, ensure it is linked into existing routes, navigation, or layouts so there are no orphaned pages or components.

## Dev workflows

- Local dev: `npm run dev` (Astro dev server).
- Build: `npm run build`; Preview: `npm run preview` (see [package.json](package.json)).
- Deployment: GitHub Pages workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds to `dist/` on push to `main`.

## Integration points

- React integration enabled in [astro.config.mjs](astro.config.mjs) via `@astrojs/react`.
- Static assets are served from [public/](public/); example icon usage in [src/components/Social.astro](src/components/Social.astro).
