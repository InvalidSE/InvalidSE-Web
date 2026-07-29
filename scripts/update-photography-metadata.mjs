import { spawnSync } from 'node:child_process';
import { readdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const ROOT_DIR = resolve('static/photography');
const METADATA_PATH = join(ROOT_DIR, 'metadata.json');
const SUPPORTED_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

const entries = await readdir(ROOT_DIR, { withFileTypes: true });
const files = entries
	.filter((entry) => entry.isFile())
	.filter((entry) => SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase()))
	.map((entry) => entry.name)
	.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const photos = {};

for (const fileName of files) {
	const filePath = join(ROOT_DIR, fileName);
	const result = spawnSync('magick', ['identify', '-format', '%w %h', filePath], {
		encoding: 'utf8'
	});

	if (result.status !== 0) {
		console.warn(`Skipped ${fileName}: ${result.stderr.trim() || 'ImageMagick identify failed.'}`);
		continue;
	}

	const [widthValue, heightValue] = result.stdout.trim().split(/\s+/);
	const width = Number(widthValue);
	const height = Number(heightValue);

	if (!Number.isFinite(width) || !Number.isFinite(height)) {
		console.warn(`Skipped ${fileName}: could not parse dimensions.`);
		continue;
	}

	photos[fileName] = { width, height };
}

await writeFile(
	METADATA_PATH,
	JSON.stringify(
		{
			generatedAt: new Date().toISOString(),
			photos
		},
		null,
		2
	) + '\n'
);

console.log(`Wrote metadata for ${Object.keys(photos).length} photo(s) to ${METADATA_PATH}.`);
