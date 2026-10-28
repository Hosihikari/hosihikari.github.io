import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await getCollection('docs');
  return entries.map((entry) => ({ params: { slug: entry.id } }));
};

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug ?? '';
  const entries = await getCollection('docs');
  const entry = entries.find((candidate) => candidate.id === slug);

  if (!entry) {
    return new Response('Not found\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const body = [
    `# ${entry.data.title}`,
    '',
    entry.data.description ? `> ${entry.data.description}` : '',
    '',
    entry.body ?? '',
  ]
    .join('\n')
    .trimEnd();

  return new Response(`${body}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
