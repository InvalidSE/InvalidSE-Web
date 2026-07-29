import { spawnSync } from 'node:child_process';
import { copyFile, mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

const ROOT_DIR = resolve('static/photography');
const TEMP_DIR_PREFIX = join(tmpdir(), 'invalidse-photo-compress-');
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const getMagickArgs = (inputPath, outputPath, extension) => {
	if (extension === '.png') {
		return [
			inputPath,
			'-strip',
			'-define',
			'png:compression-level=9',
			'-define',
			'png:compression-filter=5',
			outputPath
		];
	}

	if (extension === '.webp') {
		return [inputPath, '-strip', '-quality', '82', outputPath];
	}

	return [
		inputPath,
		'-strip',
		'-interlace',
		'Plane',
		'-sampling-factor',
		'4:2:0',
		'-quality',
		'82',
		outputPath
	];
};

const formatBytes = (bytes) => {
	if (bytes < 1024) {
		return `${bytes} B`;
	}

	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}

	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const collectFiles = async (directory) => {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const fullPath = join(directory, entry.name);
			if (entry.isDirectory()) {
				return collectFiles(fullPath);
			}

			return entry.isFile() ? [fullPath] : [];
		})
	);

	return files.flat();
};

const tempDirectory = await mkdtemp(TEMP_DIR_PREFIX);

try {
	const files = await collectFiles(ROOT_DIR);
	const imageFiles = files.filter((filePath) =>
		SUPPORTED_EXTENSIONS.has(extname(filePath).toLowerCase())
	);

	if (imageFiles.length === 0) {
		console.log('No supported images found in static/photography.');
		process.exit(0);
	}

	let compressedCount = 0;
	let skippedCount = 0;
	let savedBytes = 0;

	for (const filePath of imageFiles) {
		const extension = extname(filePath).toLowerCase();
		const tempPath = join(tempDirectory, `${compressedCount + skippedCount}${extension}`);
		const originalStats = await stat(filePath);
		const result = spawnSync('magick', getMagickArgs(filePath, tempPath, extension), {
			encoding: 'utf8'
		});

		if (result.status !== 0) {
			console.warn(`Skipped ${filePath}: ${result.stderr.trim() || 'ImageMagick failed.'}`);
			skippedCount += 1;
			continue;
		}

		const compressedStats = await stat(tempPath);
		if (compressedStats.size >= originalStats.size) {
			await rm(tempPath, { force: true });
			skippedCount += 1;
			console.log(
				`Kept original ${filePath} (${formatBytes(originalStats.size)} <= ${formatBytes(compressedStats.size)})`
			);
			continue;
		}

		await copyFile(tempPath, filePath);
		await rm(tempPath, { force: true });
		compressedCount += 1;
		savedBytes += originalStats.size - compressedStats.size;
		console.log(
			`Compressed ${filePath} (${formatBytes(originalStats.size)} -> ${formatBytes(compressedStats.size)})`
		);
	}

	console.log('');
	console.log(
		`Finished. Compressed ${compressedCount} file${compressedCount === 1 ? '' : 's'}, skipped ${skippedCount}, saved ${formatBytes(savedBytes)}.`
	);
} finally {
	await rm(tempDirectory, { recursive: true, force: true });
}
