import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nambaf.github.io',
  base: '/kiteplanet-oss',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets',
  },
});
