import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const sections = ['server', 'develop', 'embed'];

const clean = (body: string) => {
  const out: string[] = [];
  let inFence = false;
  let blank = false;

  for (const line of body.replace(/\r\n?/g, '\n').split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      blank = false;
      continue;
    }

    if (inFence) {
      out.push(line);
      continue;
    }

    if (/^\s*import .*$/.test(line)) continue;
    if (/^\s*<\/?[A-Z][A-Za-z0-9]*[^>]*>\s*$/.test(line)) continue;

    if (line.trim() === '') {
      if (!blank) out.push('');
      blank = true;
      continue;
    }

    blank = false;
    out.push(line);
  }

  return out.join('\n').trim();
};

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://hf.srcz.one');
  const entries = await getCollection('docs', ({ id, data }) => {
    return !id.startsWith('zh/') && id !== 'index' && id !== '404' && !data.draft;
  });

  const bySection = (prefix: string) =>
    entries
      .filter(({ id }) => id === prefix || id.startsWith(`${prefix}/`))
      .sort((a, b) => (a.id === prefix ? -1 : b.id === prefix ? 1 : a.id.localeCompare(b.id)));

  const ordered = [...sections.flatMap(bySection), ...entries.filter(({ id }) => id === 'releases')];
  const source = (id: string) => new URL(`/${id}/`, base).href;
  const page = (id: string, title: string, body?: string) =>
    [`# ${title}`, '', `Source: ${source(id)}`, '', clean(body ?? '')].join('\n');

  const body = [
    '# Hosihikari Framework — full documentation',
    '',
    '> Generated from the English documentation pages. Each section starts with its source URL.',
    '',
    ...ordered.map(({ id, data, body: content }) => `---\n\n${page(id, data.title, content)}`),
    '',
  ];

  return new Response(body.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
