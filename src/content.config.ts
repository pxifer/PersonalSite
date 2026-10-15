import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string(),
      summary: z.string(),
      outcome: z.string(),
      period: z.string(),
      role: z.string(),
      stack: z.array(z.string()).min(1),
      cover: z.string(),
      order: z.number().int(),
      githubUrl: z.url().optional(),
      demoUrl: z.url().optional(),
      screenshots: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .optional(),
      isExample: z.boolean().default(true),
    }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()),
    published: z.boolean().default(false),
    isExample: z.boolean().default(true),
  }),
});

export const collections = { projects, blog };
