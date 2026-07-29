import type { PageServerLoad } from './$types';

type PhotoDirEntry = {
	name: string;
	isFile(): boolean;
};

type Readdir = (
	path: URL,
	options: { withFileTypes: true }
) => Promise<PhotoDirEntry[]>;

type Photo = {
	name: string;
	src: string;
	alt: string;
	width: number | null;
	height: number | null;
};

const PHOTOGRAPHY_DIR = new URL('../../../static/photography/', import.meta.url);
const PHOTOGRAPHY_METADATA_PATH = new URL('../../../static/photography/metadata.json', import.meta.url);
const IMAGE_EXTENSIONS = new Set([
	'.avif',
	'.gif',
	'.jpeg',
	'.jpg',
	'.png',
	'.webp'
]);

const getExtension = (fileName: string) => {
	const lastDot = fileName.lastIndexOf('.');
	return lastDot === -1 ? '' : fileName.slice(lastDot).toLowerCase();
};

const readPhotoMetadata = async () => {
	try {
		const { readFile } = (await import('node:fs/promises' as string)) as {
			readFile(path: URL, encoding: 'utf8'): Promise<string>;
		};
		const raw = await readFile(PHOTOGRAPHY_METADATA_PATH, 'utf8');
		const parsed = JSON.parse(raw) as {
			photos?: Record<string, { width?: number; height?: number }>;
		};

		return parsed.photos ?? {};
	} catch {
		return {};
	}
};

export const load: PageServerLoad = async () => {
	try {
		const { readdir } = (await import('node:fs/promises' as string)) as {
			readdir: Readdir;
		};
		const entries = await readdir(PHOTOGRAPHY_DIR, { withFileTypes: true });
		const photoMetadata = await readPhotoMetadata();
		const photos: Photo[] = entries
			.filter((entry) => entry.isFile())
			.filter((entry) => IMAGE_EXTENSIONS.has(getExtension(entry.name)))
			.map((entry) => ({
				name: entry.name,
				src: `/photography/${entry.name}`,
				alt: entry.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
				width: photoMetadata[entry.name]?.width ?? null,
				height: photoMetadata[entry.name]?.height ?? null
			}))
			.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

		return { photos };
	} catch {
		return { photos: [] };
	}
};
