const contentModules = import.meta.glob('../content/projects/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function getSlugFromPath(path: string): string {
  return path.split('/').pop()?.replace(/\.md$/, '') ?? '';
}

export function getProjectContent(slug: string): string | null {
  const moduleEntry = Object.entries(contentModules).find(([path]) => getSlugFromPath(path) === slug);

  if (!moduleEntry) {
    return null;
  }

  return moduleEntry[1];
}
