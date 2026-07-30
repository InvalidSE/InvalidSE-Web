import { spawnSync } from 'node:child_process';
import { copyFile, mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

const ROOT_DIRECTORIES = [
	resolve('static/photography'),
	resolve('static/projects'),
	resolve('static/placeholders')
];
const TEMP_DIR_PREFIX = join(tmpdir(), 'invalidse-photo-compress-');
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MIN_COMPRESS_SIZE_BYTES = Math.round(2.5 * 1024 * 1024);
const TARGET_MAX_SIZE_BYTES = MIN_COMPRESS_SIZE_BYTES;
const AGGRESSIVE_SOURCE_SIZE_BYTES = 10 * 1024 * 1024;

const getMagickArgs = (inputPath, outputPath, extension, quality = 82) => {
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
		return [inputPath, '-strip', '-quality', String(quality), outputPath];
	}

	return [
		inputPath,
		'-strip',
		'-interlace',
		'Plane',
		'-sampling-factor',
		'4:2:0',
		'-quality',
		String(quality),
		outputPath
	];
};

const getQualityAttempts = (extension, originalSize) => {
	if (extension === '.png') {
		return [null];
	}

	if (originalSize >= AGGRESSIVE_SOURCE_SIZE_BYTES) {
		return [82, 76, 72, 68];
	}

	return [82];
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
	const fileGroups = await Promise.all(ROOT_DIRECTORIES.map((directory) => collectFiles(directory)));
	const files = fileGroups.flat();
	const imageFiles = files.filter((filePath) =>
		SUPPORTED_EXTENSIONS.has(extname(filePath).toLowerCase())
	);

	if (imageFiles.length === 0) {
		console.log('No supported images found in configured image directories.');
		process.exit(0);
	}

	let compressedCount = 0;
	let skippedCount = 0;
	let savedBytes = 0;

	for (const filePath of imageFiles) {
		const extension = extname(filePath).toLowerCase();
		const originalStats = await stat(filePath);

		if (originalStats.size < MIN_COMPRESS_SIZE_BYTES) {
			skippedCount += 1;
			console.log(
				`Skipped ${filePath} (${formatBytes(originalStats.size)} is below ${formatBytes(MIN_COMPRESS_SIZE_BYTES)})`
			);
			continue;
		}

		const attemptKey = `${compressedCount + skippedCount}`;
		const qualityAttempts = getQualityAttempts(extension, originalStats.size);
		let bestCandidate = null;
		let lastFailureMessage = '';

		for (const [attemptIndex, quality] of qualityAttempts.entries()) {
			const candidatePath = join(tempDirectory, `${attemptKey}-${attemptIndex}${extension}`);
			const result = spawnSync(
				'magick',
				getMagickArgs(filePath, candidatePath, extension, quality ?? 82),
				{
					encoding: 'utf8'
				}
			);

			if (result.status !== 0) {
				lastFailureMessage = result.stderr.trim() || 'ImageMagick failed.';
				await rm(candidatePath, { force: true });
				continue;
			}

			const candidateStats = await stat(candidatePath);
			if (!bestCandidate || candidateStats.size < bestCandidate.size) {
				if (bestCandidate) {
					await rm(bestCandidate.path, { force: true });
				}

				bestCandidate = {
					path: candidatePath,
					size: candidateStats.size,
					quality
				};
			} else {
				await rm(candidatePath, { force: true });
			}

			if (candidateStats.size <= TARGET_MAX_SIZE_BYTES) {
				break;
			}
		}

		if (!bestCandidate) {
			console.warn(`Skipped ${filePath}: ${lastFailureMessage || 'ImageMagick failed.'}`);
			skippedCount += 1;
			continue;
		}

		if (bestCandidate.size >= originalStats.size) {
			await rm(bestCandidate.path, { force: true });
			skippedCount += 1;
			console.log(
				`Kept original ${filePath} (${formatBytes(originalStats.size)} <= ${formatBytes(bestCandidate.size)})`
			);
			continue;
		}

		await copyFile(bestCandidate.path, filePath);
		await rm(bestCandidate.path, { force: true });
		compressedCount += 1;
		savedBytes += originalStats.size - bestCandidate.size;
		const qualitySuffix =
			bestCandidate.quality === null ? '' : ` at quality ${bestCandidate.quality}`;
		console.log(
			`Compressed ${filePath} (${formatBytes(originalStats.size)} -> ${formatBytes(bestCandidate.size)}${qualitySuffix})`
		);
	}

	console.log('');
	console.log(
		`Finished. Compressed ${compressedCount} file${compressedCount === 1 ? '' : 's'}, skipped ${skippedCount}, saved ${formatBytes(savedBytes)}.`
	);
} finally {
	await rm(tempDirectory, { recursive: true, force: true });
}
