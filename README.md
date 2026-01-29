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
| `npm run test`            | Run tests in watch mode                          |
| `npm run test:run`        | Run all tests once                               |
| `npm run test:coverage`   | Run tests with coverage report                   |
| `npm run test:e2e`        | Run end-to-end tests                             |
| `npm run test:all`        | Run all tests (unit + integration + e2e)         |

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

## 📝 Content & Data Management

### Portfolio Data
Portfolio project data is stored in `src/data/projects.json` as the single source of truth:

- **51 active projects** with validated schema
- Fields: id, codeName, industry, theme, summary, arr, arrNumeric, currency, growthStage, year, technologies
- **Validated automatically** with 20 unit tests covering schema integrity and data quality
- **Auto-validated on commit** via CI/CD pipeline

To update portfolio data:
1. Edit `src/data/projects.json` directly
2. Commit changes to GitHub
3. CI/CD tests validate data integrity automatically
4. Push triggers Vercel deployment

### Page Content
Page content is hardcoded in Astro components. To make it dynamic, consider:

- Using **Markdown files** in `src/pages/` for content pages
- Integrating a **CMS** (Contentful, Strapi, etc.)
- Using **Astro Content Collections** for organized content

## ✅ Testing

The project includes comprehensive automated tests to ensure code quality and data integrity:

### Test Coverage
- **Unit Tests** (68 tests, 100% coverage):
  - Data validation: 20 tests verifying schema, integrity, and uniqueness
  - Utility functions: 48 tests covering abbreviation, sorting, and data transformations

- **Integration Tests** (in development): Component interactions and user workflows
- **E2E Tests** (in development): Critical user journeys across browsers

### Running Tests
```bash
# Run all tests once
npm run test:run

# Run tests in watch mode (rerun on file changes)
npm run test

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run full test suite (unit + integration + e2e)
npm run test:all
```

### CI/CD Integration
- Tests run automatically on every push and pull request
- Coverage reports uploaded to Codecov
- Test failures block PR merges (branch protection)
- See [TESTING_AND_CI_CD_README.md](./TESTING_AND_CI_CD_README.md) for detailed testing strategy

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
