import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    type: z.enum(['prompt', 'article', 'page']).default('prompt'),
    status: z.enum(['draft', 'published', 'scheduled']).default('published'),
    featured: z.boolean().default(false),
    excerpt: z.string().default(''),
    model: z.string().optional(),
    category: z.string().default('Portraits'),
    image: z.string(),
    aspectRatio: z.string().default('3:4'),
    prompt: z.string().optional(),
    negativePrompt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    settings: z.object({
      stylize: z.string().optional(),
      lighting: z.string().optional(),
      lens: z.string().optional(),
      cfgScale: z.string().optional(),
      sampler: z.string().optional(),
    }).optional(),
    variables: z.array(z.object({
      name: z.string(),
      token: z.string(),
      defaultValue: z.string(),
      options: z.array(z.string()).optional()
    })).optional(),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      focusKeyword: z.string().optional(),
    }).optional(),
    author: z.string().default('Editor'),
    copiesCount: z.number().default(0),
    likesCount: z.number().default(0),
    viewsCount: z.number().default(0),
    publishedAt: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  }),
});

export const collections = {
  posts: postsCollection,
};
