// @ts-check
import { defineConfig } from 'astro/config';

// Produktionsdomain – auch per Umgebungsvariable SITE_URL überschreibbar.
const site = process.env.SITE_URL ?? 'https://celox.io';

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
