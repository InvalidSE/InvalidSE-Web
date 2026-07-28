interface ProjectFrontmatter {
	title: string;
	description: string;
	tags: string[];
	image: string;
	link?: string;
	externalLink?: string;
	video?: string;
	embedVideo?: boolean;
	github?: string;
	highlighted?: boolean;
	readMore?: boolean;
	slug?: string;
	sortOrder?: number;
}

export interface Project {
	title: string;
	description: string;
	tags: string[];
	image: string;
	link: string;
	externalLink?: string;
	video?: string;
	embedVideo: boolean;
	github?: string;
	highlighted: boolean;
	readMore: boolean;
	slug: string;
	sortOrder: number;
	content: string;
}

type FrontmatterValue = string | boolean | number | string[];

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function normalizeAssetPath(value: string): string {
	if (!value) {
		return value;
	}

	if (value.startsWith('./')) {
		return value.slice(1);
	}

	return value;
}

function parseScalar(value: string): FrontmatterValue {
	if (value === 'true') {
		return true;
	}

	if (value === 'false') {
		return false;
	}

	if (/^-?\d+$/.test(value)) {
		return Number(value);
	}

	if (value.startsWith('[') && value.endsWith(']')) {
		const items = value.slice(1, -1).trim();
		if (!items) {
			return [];
		}

		return items.split(',').map((item) => String(parseScalar(item.trim())));
	}

	if (value.startsWith('"') && value.endsWith('"')) {
		return JSON.parse(value) as string;
	}

	if (value.startsWith("'") && value.endsWith("'")) {
		return value.slice(1, -1);
	}

	return value;
}

function parseFrontmatter(source: string): { data: Record<string, FrontmatterValue>; body: string } {
	const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

	if (!match) {
		return { data: {}, body: source.trim() };
	}

	const [, rawFrontmatter, rawBody] = match;
	const data: Record<string, FrontmatterValue> = {};
	let activeArrayKey: string | null = null;

	for (const line of rawFrontmatter.split('\n')) {
		if (!line.trim()) {
			continue;
		}

		const arrayItemMatch = line.match(/^\s*-\s+(.*)$/);
		if (arrayItemMatch && activeArrayKey) {
			const existing = data[activeArrayKey];
			if (Array.isArray(existing)) {
				existing.push(String(parseScalar(arrayItemMatch[1].trim())));
			}
			continue;
		}

		activeArrayKey = null;

		const entryMatch = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
		if (!entryMatch) {
			continue;
		}

		const [, key, rawValue] = entryMatch;
		const value = rawValue.trim();

		if (!value) {
			data[key] = [];
			activeArrayKey = key;
			continue;
		}

		data[key] = parseScalar(value);
	}

	return { data, body: rawBody.trim() };
}

function normalizeProject(path: string, source: string): Project {
	const { data, body } = parseFrontmatter(source);
	const frontmatter = data as Partial<ProjectFrontmatter>;
	const filename = path.split('/').pop()?.replace(/\.md$/, '') ?? '';
	const slug = frontmatter.slug ?? slugify(frontmatter.title ?? filename);
	const readMore = frontmatter.readMore ?? true;
	const originalLink = frontmatter.link ?? '';

	if (!frontmatter.title || !frontmatter.description || !frontmatter.image || !frontmatter.tags) {
		throw new Error(`Project frontmatter is missing required fields for ${path}`);
	}

	return {
		title: frontmatter.title,
		description: frontmatter.description,
		tags: frontmatter.tags,
		image: normalizeAssetPath(frontmatter.image),
		link: readMore ? `/projects/${slug}` : originalLink,
		externalLink: frontmatter.externalLink ?? '',
		video: frontmatter.video ?? '',
		embedVideo: frontmatter.embedVideo ?? true,
		github: frontmatter.github ?? '',
		highlighted: frontmatter.highlighted ?? false,
		readMore,
		slug,
		sortOrder: frontmatter.sortOrder ?? Number.MAX_SAFE_INTEGER,
		content: body
	};
}

const projectFiles = import.meta.glob('./content/projects/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

export const projects: Project[] = Object.entries(projectFiles)
	.map(([path, source]) => normalizeProject(path, source))
	.sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));

export const highlightedProjects = projects.filter((project) => project.highlighted);

export function getProjectBySlug(slug: string): Project | undefined {
	return projects.find((project) => project.slug === slug);
}
