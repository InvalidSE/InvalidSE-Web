import { error } from '@sveltejs/kit';

import { getProjectBySlug } from '$lib/projects';

export function load({ params }) {
	const project = getProjectBySlug(params.slug);

	if (!project || !project.readMore) {
		throw error(404, 'Project not found');
	}

	return { project };
}
