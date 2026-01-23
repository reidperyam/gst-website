# Global Strategic Technologies - Astro Website

A modern, high-performance static site for GST built with Astro and deployed to Vercel. Features a tech brutalist design with dark mode support.

## 🚀 Project Structure

```text
/
├── public/              # Static assets (favicons, etc.)
├── src/
│   ├── components/      # Reusable Astro components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── StatsBar.astro
│   │   ├── CTASection.astro
│   │   └── ThemeToggle.astro
│   ├── layouts/         # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/           # Page routes (auto-routed)
│   │   └── index.astro
│   └── styles/          # Global stylesheets
│       └── global.css
├── astro.config.mjs     # Astro configuration (Vercel adapter)
└── package.json
```

## ✨ Features

- **Tech Brutalist Design** - Clean, minimal aesthetic with dark mode toggle
- **Responsive** - Mobile-first design that works on all devices
- **Dark Theme** - Persistent dark mode with localStorage
- **Fast** - Static site generation with Astro
- **Accessible** - WCAG-compliant with focus states and semantic HTML
- **Vercel Ready** - Pre-configured for static deployment

## 🧞 Commands

All commands are run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Install dependencies                             |
| `npm run dev`             | Start dev server at `http://localhost:4321`      |
| `npm run build`           | Build production site to `./dist/`               |
| `npm run preview`         | Preview production build locally                 |
| `npm run astro ...`       | Run Astro CLI commands                           |

## 🔧 Development

To work on the site locally:

```bash
npm install
npm run dev
```

Then open `http://localhost:4321` in your browser.

### Making Changes

- **Pages**: Edit files in `src/pages/`
- **Components**: Edit files in `src/components/`
- **Styles**: Edit `src/styles/global.css`

Changes to components and styles hot-reload automatically in dev mode.

## 🚢 Deployment to Vercel

The site is configured to deploy to Vercel as a static site.

### Prerequisites

- GitHub repository with this code
- Vercel account connected to GitHub

### Deploy

1. Push code to GitHub
2. Vercel automatically detects changes and deploys
3. Visit your Vercel dashboard to manage deployments

**Build Command:** `npm run build`
**Output Directory:** `dist`

## 📝 Content Management

Currently, content is hardcoded in the Astro components. To make it dynamic, consider:

- Using **Markdown files** in `src/pages/` for content pages
- Integrating a **CMS** (Contentful, Strapi, etc.)
- Using **Astro Content Collections** for organized content

## 🎨 Design System

- **Primary Color:** #05cd99 (Teal)
- **Background Light:** #f5f5f5 (Off-white)
- **Background Dark:** #0a0a0a (Near black)
- **Font:** Helvetica Neue, Arial, sans-serif
- **Grid:** 50px checkerboard pattern background

## 📚 Learn More

- [Astro Documentation](https://docs.astro.build)
- [Vercel Documentation](https://vercel.com/docs)
- [@astrojs/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/)
