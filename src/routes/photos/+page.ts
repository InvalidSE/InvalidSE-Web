import type { PageLoad } from './$types';

import photoMetadata from '../../../static/photography/metadata.json';

type Photo = {
	name: string;
	src: string;
	alt: string;
	width: number | null;
	height: number | null;
};

type PhotoMetadata = {
	photos?: Record<string, { width?: number; height?: number }>;
};

const photos = Object.entries((photoMetadata as PhotoMetadata).photos ?? {})
	.map(([name, metadata]): Photo => ({
		name,
		src: `/photography/${name}`,
		alt: name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
		width: metadata.width ?? null,
		height: metadata.height ?? null
	}))
	.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

export const prerender = true;

export const load: PageLoad = () => {
	return { photos };
};
