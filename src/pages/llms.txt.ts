import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const sections = [
  { prefix: 'server', label: 'Server' },
  { prefix: 'develop', label: 'Develop' },
  { prefix: 'embed', label: 'Embed' },
];

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://hf.srcz.one');
  const entries = await getCollection('docs', ({ id, data }) => {
    return !id.startsWith('zh/') && id !== 'index' && id !== '404' && !data.draft;
  });

  const bySection = (prefix: string) =>
    entries
      .filter(({ id }) => id === prefix || id.startsWith(`${prefix}/`))
      .sort((a, b) => (a.id === prefix ? -1 : b.id === prefix ? 1 : a.id.localeCompare(b.id)));

  const line = (id: string, title: string, description?: string) =>
    `- [${title}](${new URL(`/${id}/`, base).href})${description ? `: ${description}` : ''}`;

  const body = [
    '# Hosihikari Framework',
    '',
    '> Loads and manages .NET plugins inside Bedrock Dedicated Server. The documentation covers running a server, writing plugins, and embedding the plugin manager in another process.',
    '',
    ...sections.flatMap(({ prefix, label }) => [
      `## ${label}`,
      '',
      ...bySection(prefix).map(({ id, data }) => line(id, data.title, data.description)),
      '',
    ]),
    '## Releases',
    '',
    ...entries.filter(({ id }) => id === 'releases').map(({ id, data }) => line(id, data.title, data.description)),
    '',
    '## Full content',
    '',
    `- [llms-full.txt](${new URL('/llms-full.txt', base).href}): all English documentation pages in one file.`,
    '',
    '## Other languages',
    '',
    `- [简体中文](${new URL('/zh/', base).href}): the same documentation in Chinese.`,
    '',
  ];

  return new Response(body.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
