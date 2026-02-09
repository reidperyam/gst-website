// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel({
    webAnalytics: { enabled: false }
  }),
  devToolbar: {
    enabled: false // Disable dev toolbar to prevent interference with E2E tests
  },
});
