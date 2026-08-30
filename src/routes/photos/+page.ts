import type { PageLoad } from './$types';

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

export const prerender = true;

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/photography/metadata.json');
	const photoMetadata = (await response.json()) as PhotoMetadata;
	const photos = Object.entries(photoMetadata.photos ?? {})
		.map(([name, metadata]): Photo => ({
			name,
			src: `/photography/${name}`,
			alt: name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
			width: metadata.width ?? null,
			height: metadata.height ?? null
		}))
		.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

	return { photos };
};
