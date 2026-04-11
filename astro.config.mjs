// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://globalstrategic.tech',
  adapter: vercel({
    webAnalytics: { enabled: true },
    isr: {
      expiration: 60 * 60 * 6, // 6 hours — revalidation interval for SSR pages (Radar)
    },
  }),
  devToolbar: {
    enabled: false, // Disable dev toolbar to prevent interference with E2E tests
  },
  vite: {
    css: {
      // Phase 3 Commit 0d: replace Vite's default esbuild CSS pipeline with
      // LightningCSS — a single Rust-based parser/transformer/minifier that
      // handles autoprefixing, minification, modern-CSS down-leveling (CSS
      // nesting, oklch(), color-mix(), light-dark()), vendor-prefix cleanup,
      // and stricter syntax validation. Reversible by removing this block.
      // See src/docs/development/DEVELOPER_TOOLING.md for details.
      transformer: 'lightningcss',
    },
  },
});
