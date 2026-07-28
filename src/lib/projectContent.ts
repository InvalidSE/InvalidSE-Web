const markdownModules = import.meta.glob('../content/projects/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

const typstModules = import.meta.glob('../content/projects/*.{typ,typst}', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function getSlugFromPath(path: string): string {
  return path.split('/').pop()?.replace(/\.(md|typ|typst)$/, '') ?? '';
}

export function getProjectContent(slug: string): { content: string | null; format: 'markdown' | 'typst' } {
  const markdownEntry = Object.entries(markdownModules).find(([path]) => getSlugFromPath(path) === slug);
  if (markdownEntry) {
    return { content: markdownEntry[1], format: 'markdown' };
  }

  const typstEntry = Object.entries(typstModules).find(([path]) => getSlugFromPath(path) === slug);
  if (typstEntry) {
    return { content: typstEntry[1], format: 'typst' };
  }

  return { content: null, format: 'markdown' };
}
