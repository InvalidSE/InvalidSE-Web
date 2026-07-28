import { error } from '@sveltejs/kit';
import { projects } from '$lib/projects';
import { getProjectContent } from '$lib/projectContent';

export function load({ params }) {
  const project = projects.find((item) => item.slug === params.slug);

  if (!project) {
    throw error(404, 'Project not found');
  }

  return {
    project,
    content: getProjectContent(params.slug)
  };
}
