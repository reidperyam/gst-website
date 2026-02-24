import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const signals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/signals' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()),
    relatedUrls: z.array(z.string()).optional(),
  }),
});

export const collections = { signals };
