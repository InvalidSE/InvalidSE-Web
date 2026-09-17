<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	type InputMode = 'draw' | 'upload';
	type DrawTool = 'black' | 'red' | 'erase';
	type StatusTone = 'info' | 'success' | 'error';

	type PreparedImage = {
		blob: Blob;
		contentType: string;
		source: string;
	};

	type RenderOptions = {
		enableBlack: boolean;
		enableRed: boolean;
	};

	type ImagePreviewResponse = {
		status: string;
		color_mode: string;
		black_enabled: boolean;
		red_enabled: boolean;
		has_black: boolean;
		has_red: boolean;
		preview_png_base64: string;
		discord_posted: boolean;
	};

	type UpdateImageResponse = {
		status: string;
		current_image_id: number;
	};

	type HealthState = 'checking' | 'online' | 'offline';

	type CanvasPoint = {
		x: number;
		y: number;
	};

	type QuadPoint = CanvasPoint;

	type ConfettiPiece = {
		id: number;
		style: string;
	};

	type PostImageResult<T> = {
		data: T;
		preparedImage: PreparedImage;
	};

	const CANVAS_WIDTH = 296;
	const CANVAS_HEIGHT = 128;
	const MAX_HISTORY_STATES = 40;
	const HEALTH_POLL_MS = 15000;
	const apiBaseUrl = 'https://invalidse-dash.host.qrl.nz'.replace(/\/$/, '');
	const successMockupBackgroundUrl = './projects/dashboard/example.jpg';
	const successQuad: [QuadPoint, QuadPoint, QuadPoint, QuadPoint] = [
		{ x: 1354, y: 1689 },
		{ x: 2532, y: 1829 },
		{ x: 2481, y: 2268 },
		{ x: 1338, y: 2128 }
	];

	let activeMode: InputMode = 'draw';
	let activeTool: DrawTool = 'black';
	let brushSize = 4;

	let canvas: HTMLCanvasElement;
	let drawingContext: CanvasRenderingContext2D | null = null;
	let uploadInput: HTMLInputElement;

	let uploadedFile: File | null = null;
	let uploadedPreparedImage: PreparedImage | null = null;
	let blackPreviewUrl = '';
	let redPreviewUrl = '';
	let lastPreparedImage: PreparedImage | null = null;
	let uploadPreviewRequestId = 0;

	let isDrawing = false;
	let strokeChanged = false;
	let lastPoint: CanvasPoint | null = null;
	let history: ImageData[] = [];
	let redoHistory: ImageData[] = [];

	let isPreviewing = false;
	let isSending = false;
	let statusMessage = 'Draw something or upload an image, then send it to the dashboard.';
	let statusTone: StatusTone = 'info';
	let healthState: HealthState = 'checking';
	let healthMessage = 'Checking dashboard status...';
	let healthPollHandle: ReturnType<typeof setInterval> | null = null;
	let successModalOpen = false;
	let successMockupUrl = '';
	let confettiPieces: ConfettiPiece[] = [];

	function endpoint(path: string): string {
		return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
	}

	function setStatus(message: string, tone: StatusTone = 'info') {
		statusMessage = message;
		statusTone = tone;
	}

	function clearBackendPreview() {
		uploadedPreparedImage = null;
		blackPreviewUrl = '';
		redPreviewUrl = '';
		lastPreparedImage = null;
	}

	function initializeCanvas() {
		if (!canvas) {
			return;
		}

		drawingContext = canvas.getContext('2d', { alpha: false });

		if (!drawingContext) {
			setStatus('Could not initialize the drawing canvas.', 'error');
			return;
		}

		drawingContext.imageSmoothingEnabled = false;
		drawingContext.fillStyle = '#ffffff';
		drawingContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		history = [drawingContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)];
		redoHistory = [];
	}

	function pushHistoryState() {
		if (!drawingContext) {
			return;
		}

		const snapshot = drawingContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		history = [...history.slice(-(MAX_HISTORY_STATES - 1)), snapshot];
		redoHistory = [];
	}

	function toolColor(tool: DrawTool): string {
		if (tool === 'red') {
			return '#d62828';
		}

		if (tool === 'erase') {
			return '#ffffff';
		}

		return '#111827';
	}

	function clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}

	function toolButtonStyle(tool: DrawTool): string {
		if (tool === 'red') {
			return 'background-color: #d62828; color: #ffffff;';
		}

		if (tool === 'erase') {
			return 'background-color: #ffffff; color: #111827;';
		}

		return 'background-color: #111827; color: #ffffff;';
	}

	function createConfettiPieces(): ConfettiPiece[] {
		const colors = ['#d62828', '#2f9e44', '#111827', '#f4a261', '#457b9d', '#e9c46a'];

		return Array.from({ length: 28 }, (_, index) => {
			const left = 4 + Math.random() * 92;
			const delay = Math.random() * 0.35;
			const duration = 1.9 + Math.random() * 1.4;
			const rotation = Math.random() * 360;
			const size = 8 + Math.random() * 10;
			const color = colors[index % colors.length];

			return {
				id: index,
				style: `left:${left}%;--confetti-delay:${delay}s;--confetti-duration:${duration}s;--confetti-rotate:${rotation}deg;width:${size}px;height:${size * 0.7}px;background:${color};`
			};
		});
	}

	function closeSuccessModal() {
		successModalOpen = false;
		confettiPieces = [];
	}

	function loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = () => reject(new Error(`Could not load image: ${src}`));
			image.src = src;
		});
	}

	function interpolateQuadPoint(
		topLeft: QuadPoint,
		topRight: QuadPoint,
		bottomRight: QuadPoint,
		bottomLeft: QuadPoint,
		u: number,
		v: number
	): QuadPoint {
		const topX = topLeft.x + (topRight.x - topLeft.x) * u;
		const topY = topLeft.y + (topRight.y - topLeft.y) * u;
		const bottomX = bottomLeft.x + (bottomRight.x - bottomLeft.x) * u;
		const bottomY = bottomLeft.y + (bottomRight.y - bottomLeft.y) * u;

		return {
			x: topX + (bottomX - topX) * v,
			y: topY + (bottomY - topY) * v
		};
	}

	function drawImageTriangle(
		context: CanvasRenderingContext2D,
		image: CanvasImageSource,
		source: [QuadPoint, QuadPoint, QuadPoint],
		destination: [QuadPoint, QuadPoint, QuadPoint]
	) {
		const [s0, s1, s2] = source;
		const [d0, d1, d2] = destination;
		const denominator =
			s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);

		if (Math.abs(denominator) < 1e-6) {
			return;
		}

		const a =
			(d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) /
			denominator;
		const b =
			(d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) /
			denominator;
		const c =
			(d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) /
			denominator;
		const d =
			(d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) /
			denominator;
		const e =
			(d0.x * (s1.x * s2.y - s2.x * s1.y) +
				d1.x * (s2.x * s0.y - s0.x * s2.y) +
				d2.x * (s0.x * s1.y - s1.x * s0.y)) /
			denominator;
		const f =
			(d0.y * (s1.x * s2.y - s2.x * s1.y) +
				d1.y * (s2.x * s0.y - s0.x * s2.y) +
				d2.y * (s0.x * s1.y - s1.x * s0.y)) /
			denominator;

		context.save();
		context.beginPath();
		context.moveTo(d0.x, d0.y);
		context.lineTo(d1.x, d1.y);
		context.lineTo(d2.x, d2.y);
		context.closePath();
		context.clip();
		context.transform(a, b, c, d, e, f);
		context.drawImage(image, 0, 0);
		context.restore();
	}

	function drawImageIntoQuad(
		context: CanvasRenderingContext2D,
		image: HTMLImageElement,
		quad: [QuadPoint, QuadPoint, QuadPoint, QuadPoint]
	) {
		const [topLeft, topRight, bottomRight, bottomLeft] = quad;
		const columns = 24;
		const rows = 12;

		for (let row = 0; row < rows; row += 1) {
			for (let column = 0; column < columns; column += 1) {
				const u0 = column / columns;
				const v0 = row / rows;
				const u1 = (column + 1) / columns;
				const v1 = (row + 1) / rows;

				const sourceTopLeft = { x: image.width * u0, y: image.height * v0 };
				const sourceTopRight = { x: image.width * u1, y: image.height * v0 };
				const sourceBottomRight = { x: image.width * u1, y: image.height * v1 };
				const sourceBottomLeft = { x: image.width * u0, y: image.height * v1 };

				const destinationTopLeft = interpolateQuadPoint(
					topLeft,
					topRight,
					bottomRight,
					bottomLeft,
					u0,
					v0
				);
				const destinationTopRight = interpolateQuadPoint(
					topLeft,
					topRight,
					bottomRight,
					bottomLeft,
					u1,
					v0
				);
				const destinationBottomRight = interpolateQuadPoint(
					topLeft,
					topRight,
					bottomRight,
					bottomLeft,
					u1,
					v1
				);
				const destinationBottomLeft = interpolateQuadPoint(
					topLeft,
					topRight,
					bottomRight,
					bottomLeft,
					u0,
					v1
				);

				drawImageTriangle(
					context,
					image,
					[sourceTopLeft, sourceTopRight, sourceBottomRight],
					[destinationTopLeft, destinationTopRight, destinationBottomRight]
				);
				drawImageTriangle(
					context,
					image,
					[sourceTopLeft, sourceBottomRight, sourceBottomLeft],
					[destinationTopLeft, destinationBottomRight, destinationBottomLeft]
				);
			}
		}
	}

	async function createSuccessMockup(overlayImageUrl: string): Promise<string> {
		const [background, overlay] = await Promise.all([
			loadImage(successMockupBackgroundUrl),
			loadImage(overlayImageUrl)
		]);
		const output = document.createElement('canvas');
		output.width = background.naturalWidth || background.width;
		output.height = background.naturalHeight || background.height;
		const context = output.getContext('2d');

		if (!context) {
			throw new Error('Could not create success preview.');
		}

		context.drawImage(background, 0, 0, output.width, output.height);
		context.imageSmoothingEnabled = true;
		drawImageIntoQuad(context, overlay, successQuad);

		return output.toDataURL('image/jpeg', 0.92);
	}

	async function openSuccessExperience(overlayImageUrl: string) {
		successMockupUrl = await createSuccessMockup(overlayImageUrl);
		confettiPieces = createConfettiPieces();
		successModalOpen = true;
	}

	function getCanvasPoint(event: PointerEvent): CanvasPoint {
		const bounds = canvas.getBoundingClientRect();
		const x = Math.floor(((event.clientX - bounds.left) / bounds.width) * CANVAS_WIDTH);
		const y = Math.floor(((event.clientY - bounds.top) / bounds.height) * CANVAS_HEIGHT);

		return {
			x: clamp(x, 0, CANVAS_WIDTH - 1),
			y: clamp(y, 0, CANVAS_HEIGHT - 1)
		};
	}

	function paintPixel(point: CanvasPoint) {
		if (!drawingContext) {
			return;
		}

		const halfBrush = Math.floor(brushSize / 2);
		drawingContext.fillStyle = toolColor(activeTool);
		drawingContext.fillRect(point.x - halfBrush, point.y - halfBrush, brushSize, brushSize);
	}

	function paintStroke(from: CanvasPoint, to: CanvasPoint) {
		const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1);

		for (let step = 0; step <= steps; step += 1) {
			const progress = step / steps;
			paintPixel({
				x: Math.round(from.x + (to.x - from.x) * progress),
				y: Math.round(from.y + (to.y - from.y) * progress)
			});
		}
	}

	function beginStroke(event: PointerEvent) {
		if (!drawingContext) {
			return;
		}

		event.preventDefault();
		isDrawing = true;
		strokeChanged = false;
		canvas.setPointerCapture(event.pointerId);

		const point = getCanvasPoint(event);
		paintPixel(point);
		lastPoint = point;
		strokeChanged = true;
	}

	function continueStroke(event: PointerEvent) {
		if (!isDrawing || !lastPoint) {
			return;
		}

		event.preventDefault();

		const point = getCanvasPoint(event);
		paintStroke(lastPoint, point);
		lastPoint = point;
		strokeChanged = true;
	}

	function endStroke(event: PointerEvent) {
		if (!isDrawing) {
			return;
		}

		event.preventDefault();
		isDrawing = false;
		lastPoint = null;

		if (canvas.hasPointerCapture(event.pointerId)) {
			canvas.releasePointerCapture(event.pointerId);
		}

		if (strokeChanged) {
			pushHistoryState();
			clearBackendPreview();
		}
	}

	function clearCanvas() {
		if (!drawingContext) {
			return;
		}

		drawingContext.fillStyle = '#ffffff';
		drawingContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		pushHistoryState();
		clearBackendPreview();
		setStatus('Canvas cleared.', 'info');
	}

	function undoLastStroke() {
		if (!drawingContext || history.length <= 1) {
			return;
		}

		redoHistory = [
			drawingContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT),
			...redoHistory
		].slice(0, MAX_HISTORY_STATES);
		history = history.slice(0, -1);
		drawingContext.putImageData(history[history.length - 1], 0, 0);
		clearBackendPreview();
		setStatus('Undid the last stroke.', 'info');
	}

	function redoLastStroke() {
		if (!drawingContext || redoHistory.length === 0) {
			return;
		}

		const [nextState, ...remainingRedoHistory] = redoHistory;
		redoHistory = remainingRedoHistory;
		drawingContext.putImageData(nextState, 0, 0);
		history = [...history, nextState].slice(-MAX_HISTORY_STATES);
		clearBackendPreview();
		setStatus('Redid the last stroke.', 'info');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && successModalOpen) {
			closeSuccessModal();
			return;
		}

		const target = event.target;
		const tagName = target instanceof HTMLElement ? target.tagName : '';
		const isTypingTarget =
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			(target instanceof HTMLElement && target.isContentEditable);

		if (isTypingTarget || tagName === 'SELECT') {
			return;
		}

		if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
			event.preventDefault();
			undoLastStroke();
		}
	}

	async function canvasToBlob(): Promise<Blob> {
		return await new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
					return;
				}

				reject(new Error('Could not export the drawing.'));
			}, 'image/png');
		});
	}

	async function prepareImage(): Promise<PreparedImage | null> {
		if (activeMode === 'draw') {
			return {
				blob: await canvasToBlob(),
				contentType: 'image/png',
				source: 'InvalidSE Web drawing'
			};
		}

		if (!uploadedFile) {
			setStatus('Pick an image file before previewing or sending.', 'error');
			return null;
		}

		if (uploadedPreparedImage) {
			return uploadedPreparedImage;
		}

		return {
			blob: uploadedFile,
			contentType: uploadedFile.type || 'application/octet-stream',
			source: `InvalidSE Web upload (${uploadedFile.name})`
		};
	}

	function renderOptionsForMode(mode: InputMode): RenderOptions {
		return {
			enableBlack: true,
			enableRed: true
		};
	}

	async function compressPreparedImage(preparedImage: PreparedImage): Promise<PreparedImage> {
		const objectUrl = URL.createObjectURL(preparedImage.blob);

		try {
			const sourceImage = await loadImage(objectUrl);
			const longestEdge = Math.max(sourceImage.naturalWidth || sourceImage.width, sourceImage.naturalHeight || sourceImage.height);
			const maxDimension = Math.min(longestEdge, 1600);
			const scale = longestEdge > maxDimension ? maxDimension / longestEdge : 1;
			const targetWidth = Math.max(1, Math.round((sourceImage.naturalWidth || sourceImage.width) * scale));
			const targetHeight = Math.max(1, Math.round((sourceImage.naturalHeight || sourceImage.height) * scale));
			const canvas = document.createElement('canvas');
			canvas.width = targetWidth;
			canvas.height = targetHeight;
			const context = canvas.getContext('2d');

			if (!context) {
				throw new Error('Could not compress the uploaded image.');
			}

			context.fillStyle = '#ffffff';
			context.fillRect(0, 0, targetWidth, targetHeight);
			context.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);

			const compressedBlob = await new Promise<Blob>((resolve, reject) => {
				canvas.toBlob(
					(blob) => {
						if (blob) {
							resolve(blob);
							return;
						}

						reject(new Error('Could not compress the uploaded image.'));
					},
					'image/jpeg',
					0.82
				);
			});

			return {
				...preparedImage,
				blob: compressedBlob,
				contentType: 'image/jpeg'
			};
		} finally {
			URL.revokeObjectURL(objectUrl);
		}
	}

	async function performImageRequest(
		requestUrl: URL,
		preparedImage: PreparedImage
	): Promise<Response> {
		return await fetch(requestUrl, {
			method: 'POST',
			headers: {
				'Content-Type': preparedImage.contentType,
				'X-Image-Source': preparedImage.source
			},
			body: preparedImage.blob
		});
	}

	async function postImage<T>(
		path: string,
		preparedImage: PreparedImage,
		renderOptions: RenderOptions
	): Promise<PostImageResult<T>> {
		const requestUrl = new URL(endpoint(path), window.location.origin);
		requestUrl.searchParams.set('enable_black', String(renderOptions.enableBlack));
		requestUrl.searchParams.set('enable_red', String(renderOptions.enableRed));

		let effectivePreparedImage = preparedImage;
		let response = await performImageRequest(requestUrl, effectivePreparedImage);

		if (
			response.status === 413 &&
			activeMode === 'upload' &&
			effectivePreparedImage.contentType.startsWith('image/')
		) {
			setStatus('That image is a bit large. Compressing it and trying again…', 'info');
			effectivePreparedImage = await compressPreparedImage(effectivePreparedImage);
			response = await performImageRequest(requestUrl, effectivePreparedImage);
		}

		if (!response.ok) {
			throw new Error((await response.text()) || `Request failed with status ${response.status}.`);
		}

		return {
			data: (await response.json()) as T,
			preparedImage: effectivePreparedImage
		};
	}

	async function refreshHealthStatus() {
		try {
			const response = await fetch(endpoint('/health'), {
				method: 'GET',
				cache: 'no-store'
			});

			if (!response.ok) {
				throw new Error(`Health check failed with status ${response.status}.`);
			}

			healthState = 'online';
			healthMessage = 'Dashboard online';
		} catch {
			healthState = 'offline';
			healthMessage = 'Dashboard offline';
		}
	}

	async function previewPreparedImage(
		preparedImage: PreparedImage,
		renderOptions: RenderOptions,
		requestId?: number
	): Promise<PostImageResult<string> | null> {
		try {
			const result = await postImage<ImagePreviewResponse>(
				'/image/preview',
				preparedImage,
				renderOptions
			);

			if (requestId !== undefined && requestId !== uploadPreviewRequestId) {
				return null;
			}

			return {
				preparedImage: result.preparedImage,
				data: `data:image/png;base64,${result.data.preview_png_base64}`
			};
		} catch (error) {
			if (requestId !== undefined && requestId !== uploadPreviewRequestId) {
				return null;
			}

			const message = error instanceof Error ? error.message : 'Preview failed.';
			setStatus(message, 'error');
			return null;
		}
	}

	async function sendImage(renderOptions?: RenderOptions, label = 'image') {
		const preparedImage = await prepareImage();

		if (!preparedImage) {
			return;
		}

		isSending = true;
		setStatus('Sending image to the dashboard…', 'info');

		try {
			const overlayImageUrl =
				activeMode === 'draw'
					? canvas.toDataURL('image/png')
					: renderOptions?.enableRed
						? redPreviewUrl
						: blackPreviewUrl;
			const result = await postImage<UpdateImageResponse>(
				'/image',
				preparedImage,
				renderOptions ?? renderOptionsForMode(activeMode)
			);
			lastPreparedImage = result.preparedImage;
			if (activeMode === 'upload') {
				uploadedPreparedImage = result.preparedImage;
			}
			await openSuccessExperience(overlayImageUrl);
			setStatus(
				`${label[0].toUpperCase()}${label.slice(1)} sent successfully. Active image is now #${result.data.current_image_id}.`,
				'success'
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Upload failed.';
			setStatus(message, 'error');
		} finally {
			isSending = false;
		}
	}

	function setMode(mode: InputMode) {
		activeMode = mode;
		clearBackendPreview();

		if (mode === 'draw') {
			setStatus('Draw something, then send it to the dashboard.', 'info');
			return;
		}

		setStatus('Upload an image to see black-and-white and red versions automatically.', 'info');
	}

	function openUploadPicker() {
		uploadInput?.click();
	}

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		uploadedFile = file;
		clearBackendPreview();
		uploadPreviewRequestId += 1;
		const requestId = uploadPreviewRequestId;

		if (!file) {
			setStatus('No image selected.', 'info');
			return;
		}

		activeMode = 'upload';
		setStatus(`${file.name} selected. Generating both processed previews…`, 'info');
		isPreviewing = true;

		const preparedImage: PreparedImage = {
			blob: file,
			contentType: file.type || 'application/octet-stream',
			source: `InvalidSE Web upload (${file.name})`
		};

		const [blackPreview, redPreview] = await Promise.all([
			previewPreparedImage(
				preparedImage,
				{ enableBlack: true, enableRed: false },
				requestId
			),
			previewPreparedImage(
				preparedImage,
				{ enableBlack: true, enableRed: true },
				requestId
			)
		]);

		if (requestId !== uploadPreviewRequestId) {
			return;
		}

		blackPreviewUrl = blackPreview?.data ?? '';
		redPreviewUrl = redPreview?.data ?? '';
		uploadedPreparedImage = redPreview?.preparedImage ?? blackPreview?.preparedImage ?? null;

		if (blackPreviewUrl && redPreviewUrl) {
			lastPreparedImage = uploadedPreparedImage ?? preparedImage;
			setStatus('Both previews are ready. Choose the version you want to send.', 'success');
		}

		if (requestId === uploadPreviewRequestId) {
			isPreviewing = false;
		}
	}

	onMount(() => {
		initializeCanvas();

		void refreshHealthStatus();
		healthPollHandle = setInterval(() => {
			void refreshHealthStatus();
		}, HEALTH_POLL_MS);
	});

	onDestroy(() => {
		if (healthPollHandle) {
			clearInterval(healthPollHandle);
		}
	});
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="container mx-auto lg:py-24">
	<section class="title">
		<div class="flex flex-col">
			<div>
				<span class="text-5xl md:text-7xl lg:text-8xl">Make some </span><span
					class="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text animate-gradient bg-300%"
				>
					Art!
				</span>
			</div>
			<span class="my-5 max-w-3xl text-xl md:text-2xl lg:text-3xl">
                Draw an image to send to my little desktop dashboard. Or upload one!
			</span>
			<div class="flex flex-col items-center gap-2 sm:flex-row lg:flex-row">
				<a href="/" class="btn btn-outline gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="m12 19-7-7 7-7" />
					<path d="M19 12H5" />
				</svg>
				Back Home
			</a>
			</div>
		</div>
	</section>

		<!-- <div class="rounded-[2rem] border border-base-300 bg-base-200/60 px-6 py-4 text-sm text-base-content/75 md:px-8">
			<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<p>
					Canvas size:
					<span class="font-semibold text-base-content">{CANVAS_WIDTH} x {CANVAS_HEIGHT}</span>
					pixels.
				</p>
				<div
					class={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 font-medium ${
						healthState === 'online'
							? 'bg-success/15 text-success'
							: healthState === 'offline'
								? 'bg-error/15 text-error'
								: 'bg-base-100 text-base-content/70'
					}`}
				>
					<span
						class={`h-2.5 w-2.5 rounded-full ${
							healthState === 'online'
								? 'bg-success'
								: healthState === 'offline'
									? 'bg-error'
									: 'bg-base-content/40'
						}`}
					></span>
					{healthMessage}
				</div>
			</div>
		</div>
	</section> -->

	<div class="grid gap-4 md:grid-cols-2 md:gap-6">
		<img
			src="./projects/dashboard/dashboard2.png"
			alt="Dashboard front view"
			class="h-full w-full rounded-2xl object-cover"
		/>
		<img
			src="./projects/dashboard/dashboard.png"
			alt="Dashboard close-up"
			class="h-full w-full rounded-2xl object-cover"
		/>
	</div>

	<div class="spacer my-12" /> 

	<section class="flex justify-center">
		<div class="w-full max-w-5xl rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-sm md:p-8">
			<div class="flex h-full flex-col gap-5">
				<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div class="flex flex-wrap gap-3 self-start">
						<button
							type="button"
							class:mode-switch-active={activeMode === 'draw'}
							class="mode-switch"
							on:click={() => setMode('draw')}
						>
							Draw
						</button>
						<button
							type="button"
							class:mode-switch-active={activeMode === 'upload'}
							class="mode-switch"
							on:click={() => setMode('upload')}
						>
							Upload
						</button>
					</div>
				</div>

				<div class:hidden={activeMode !== 'draw'} class="flex flex-col gap-5">
						<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
							<div class="flex flex-wrap gap-3">
								<button
									type="button"
									class:tool-swatch-active={activeTool === 'black'}
									class="tool-swatch"
									on:click={() => (activeTool = 'black')}
									aria-label="Black brush"
									aria-pressed={activeTool === 'black'}
									style={toolButtonStyle('black')}
								>
									<svg
										class:tool-swatch-tick-visible={activeTool === 'black'}
										class="tool-swatch-tick"
										xmlns="http://www.w3.org/2000/svg"
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="M20 6 9 17l-5-5" />
									</svg>
								</button>
								<button
									type="button"
									class:tool-swatch-active={activeTool === 'red'}
									class="tool-swatch"
									on:click={() => (activeTool = 'red')}
									aria-label="Red brush"
									aria-pressed={activeTool === 'red'}
									style={toolButtonStyle('red')}
								>
									<svg
										class:tool-swatch-tick-visible={activeTool === 'red'}
										class="tool-swatch-tick"
										xmlns="http://www.w3.org/2000/svg"
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="M20 6 9 17l-5-5" />
									</svg>
								</button>
								<button
									type="button"
									class:tool-swatch-active={activeTool === 'erase'}
									class="tool-swatch"
									on:click={() => (activeTool = 'erase')}
									aria-label="Eraser"
									aria-pressed={activeTool === 'erase'}
									style={toolButtonStyle('erase')}
								>
									<svg
										class:tool-swatch-tick-visible={activeTool === 'erase'}
										class="tool-swatch-tick"
										xmlns="http://www.w3.org/2000/svg"
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="M20 6 9 17l-5-5" />
									</svg>
								</button>
							</div>

							<div class="flex flex-wrap gap-3">
								<button
									type="button"
									class="tool-swatch tool-swatch-utility"
									on:click={undoLastStroke}
									aria-label="Undo"
									disabled={history.length <= 1}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="M9 14 4 9l5-5" />
										<path d="M4 9h9a7 7 0 1 1 0 14h-1" />
									</svg>
								</button>
								<button
									type="button"
									class="tool-swatch tool-swatch-utility"
									on:click={redoLastStroke}
									aria-label="Redo"
									disabled={redoHistory.length === 0}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="m15 14 5-5-5-5" />
										<path d="M20 9h-9a7 7 0 1 0 0 14h1" />
									</svg>
								</button>
								<button
									type="button"
									class="tool-swatch tool-swatch-utility"
									on:click={clearCanvas}
									aria-label="Clear canvas"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.25"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="M3 6h18" />
										<path d="M8 6V4h8v2" />
										<path d="M19 6l-1 14H6L5 6" />
										<path d="M10 11v6" />
										<path d="M14 11v6" />
									</svg>
								</button>
							</div>
						</div>

						<div class="flex flex-col gap-3">
							<label class="flex items-center justify-between gap-4 text-sm font-medium text-base-content/80" for="brush-size">
								<span>Brush size</span>
								<span>{brushSize}px</span>
							</label>
							<input
								id="brush-size"
								class="range range-sm"
								type="range"
								min="1"
								max="18"
								step="1"
								bind:value={brushSize}
							/>
						</div>

						<div class="overflow-hidden border border-base-300 bg-white">
							<canvas
								bind:this={canvas}
								width={CANVAS_WIDTH}
								height={CANVAS_HEIGHT}
								class="dashboard-canvas"
								on:pointerdown={beginStroke}
								on:pointermove={continueStroke}
								on:pointerup={endStroke}
								on:pointerleave={endStroke}
								on:pointercancel={endStroke}
								aria-label="Dashboard drawing canvas"
							></canvas>
						</div>
					</div>

					<div class:hidden={activeMode !== 'upload'} class="flex flex-col gap-5">
						<div class="border border-dashed border-base-300 bg-base-200/40 p-6">
							<h2 class="text-2xl font-semibold">Upload an Image</h2>
							<div class="spacer my-5" />
							<div class="mt-5">
								<input
									bind:this={uploadInput}
									type="file"
									accept="image/*"
									tabindex="-1"
									aria-hidden="true"
									class="hidden"
									on:change={handleFileChange}
								/>
								<button
									type="button"
									class="tool-submit tool-submit-upload"
									on:click={openUploadPicker}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="M12 21V8" />
										<path d="m7 13 5-5 5 5" />
										<path d="M5 3h14" />
									</svg>
									<span>Upload!</span>
								</button>
							</div>
						</div>

						{#if uploadedFile}
							<div class="p-1">
								<div class="grid gap-4 md:grid-cols-2">
									<div>
										{#if blackPreviewUrl}
											<img
												src={blackPreviewUrl}
												alt="Black and white dashboard preview"
												class="dashboard-preview"
											/>
										{:else if isPreviewing}
											<div class="flex min-h-[12rem] items-center justify-center bg-base-200/60 px-6 text-center text-base-content/60">
												Loading preview…
											</div>
										{:else}
											<div class="flex min-h-[12rem] items-center justify-center bg-base-200/60 px-6 text-center text-base-content/60">
												Preview will appear here.
											</div>
										{/if}
									</div>

									<div>
										{#if redPreviewUrl}
											<img
												src={redPreviewUrl}
												alt="Red dashboard preview"
												class="dashboard-preview"
											/>
										{:else if isPreviewing}
											<div class="flex min-h-[12rem] items-center justify-center bg-base-200/60 px-6 text-center text-base-content/60">
												Loading preview…
											</div>
										{:else}
											<div class="flex min-h-[12rem] items-center justify-center bg-base-200/60 px-6 text-center text-base-content/60">
												Preview will appear here.
											</div>
										{/if}
									</div>
								</div>
							</div>
						{/if}
					</div>

					<div class="mt-2">
						{#if activeMode === 'upload'}
							<div class="grid gap-3 md:grid-cols-2">
								<button
									type="button"
									class="tool-submit"
									on:click={() => sendImage({ enableBlack: true, enableRed: false }, 'black and white image')}
									disabled={isPreviewing || isSending || !blackPreviewUrl}
									aria-label="Send black and white"
								>
									<span>{#if isSending}Sending…{:else}Send black and white{/if}</span>
								</button>
								<button
									type="button"
									class="tool-submit tool-submit-danger"
									on:click={() => sendImage({ enableBlack: true, enableRed: true }, 'red image')}
									disabled={isPreviewing || isSending || !redPreviewUrl}
									aria-label="Send with red"
								>
									<span>{#if isSending}Sending…{:else}Send with red{/if}</span>
								</button>
							</div>
						{:else}
							<button
								type="button"
								class="tool-submit"
								on:click={() => sendImage()}
								disabled={isPreviewing || isSending}
								aria-label="Send to Dashboard"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="22"
									height="22"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M20 6 9 17l-5-5" />
								</svg>
								<span>{#if isSending}Sending…{:else}Done!{/if}</span>
							</button>
						{/if}
					</div>
			</div>
		</div>
	</section>
</div>

{#if successModalOpen}
	<div class="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title">
		<button
			type="button"
			class="success-modal-backdrop"
			on:click={closeSuccessModal}
			aria-label="Close success modal"
		></button>
		<div class="success-confetti" aria-hidden="true">
			{#each confettiPieces as piece (piece.id)}
				<span class="confetti-piece" style={piece.style}></span>
			{/each}
		</div>
		<div class="success-modal-card">
			<h2 id="success-title" class="success-modal-title">Success! The case is WIP...</h2>
			{#if successMockupUrl}
				<img
					src={successMockupUrl}
					alt="Your artwork shown on the desk dashboard"
					class="success-modal-image"
				/>
			{/if}
			<button
				type="button"
				class="success-modal-action"
				on:click={closeSuccessModal}
			>
				YAY ART!
			</button>
		</div>
	</div>
{/if}

<style>
	.mode-switch {
		display: inline-flex;
		min-height: 3rem;
		align-items: center;
		justify-content: center;
		padding: 0.7rem 1.15rem;
		border: 1px solid rgb(148 163 184 / 0.45);
		background: color-mix(in srgb, oklch(var(--b1)) 96%, white 4%);
		color: color-mix(in srgb, oklch(var(--bc)) 92%, black 8%);
		font-size: 0.98rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			transform 140ms ease,
			background-color 140ms ease,
			color 140ms ease,
			border-color 140ms ease;
	}

	.mode-switch:hover {
		transform: translateY(-1px);
	}

	.mode-switch-active {
		border-color: #111827;
		background: #111827;
		color: #ffffff;
	}

	.success-modal {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}

	.success-modal-backdrop {
		position: absolute;
		inset: 0;
		border: 0;
		background: rgb(15 23 42 / 0.76);
		backdrop-filter: blur(4px);
	}

	.success-confetti {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.confetti-piece {
		position: absolute;
		top: -5%;
		opacity: 0.95;
		transform: rotate(var(--confetti-rotate));
		animation: confetti-fall var(--confetti-duration) ease-in forwards;
		animation-delay: var(--confetti-delay);
	}

	.success-modal-card {
		position: relative;
		z-index: 1;
		display: flex;
		width: min(92vw, 56rem);
		max-height: 90vh;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		border-radius: 1.5rem;
		background: color-mix(in srgb, oklch(var(--b1)) 94%, white 6%);
		box-shadow: 0 20px 70px rgb(15 23 42 / 0.28);
	}

	.success-modal-action {
		display: inline-flex;
		width: 100%;
		min-height: 3.5rem;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.25rem;
		border: 1px solid rgb(148 163 184 / 0.45);
		background: color-mix(in srgb, oklch(var(--b1)) 96%, white 4%);
		color: color-mix(in srgb, oklch(var(--bc)) 90%, black 10%);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			background-color 140ms ease,
			color 140ms ease,
			transform 140ms ease;
	}

	.success-modal-action:hover {
		background: #111827;
		color: #ffffff;
		transform: translateY(-1px);
	}

	.success-modal-title {
		margin: 0;
		font-size: clamp(1.8rem, 4vw, 3rem);
		font-weight: 800;
	}

	.success-modal-image {
		display: block;
		width: 100%;
		height: auto;
		max-height: 72vh;
		object-fit: contain;
	}

	.tool-swatch {
		display: inline-flex;
		height: 3rem;
		width: 3rem;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 1px solid rgb(148 163 184 / 0.55);
		cursor: pointer;
		transition:
			transform 160ms ease,
			box-shadow 160ms ease,
			border-color 160ms ease;
	}

	.tool-swatch:hover {
		transform: scale(1.05);
	}

	.tool-swatch-active {
		border-color: rgb(15 23 42 / 0.9);
		box-shadow: inset 0 0 0 2px rgb(255 255 255 / 0.28);
	}

	.tool-swatch-utility {
		background: color-mix(in srgb, oklch(var(--b1)) 92%, white 8%);
		color: color-mix(in srgb, oklch(var(--bc)) 92%, black 8%);
	}

	.tool-submit {
		display: inline-flex;
		width: 100%;
		min-height: 3.5rem;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 0.9rem 1.25rem;
		border: 1px solid #2f9e44;
		background: #2f9e44;
		color: #ffffff;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			transform 160ms ease,
			filter 160ms ease,
			opacity 160ms ease;
	}

	.tool-submit:hover {
		transform: translateY(-1px);
		filter: brightness(1.03);
	}

	.tool-submit-upload {
		background: color-mix(in srgb, oklch(var(--b1)) 94%, white 6%);
		color: color-mix(in srgb, oklch(var(--bc)) 92%, black 8%);
		border-color: rgb(148 163 184 / 0.45);
	}

	.tool-submit-danger {
		background: #d62828;
		border-color: #d62828;
		color: #ffffff;
	}

	.tool-submit:disabled {
		cursor: not-allowed;
		opacity: 0.6;
		transform: none;
		filter: none;
	}

	.tool-swatch-tick {
		opacity: 0;
		transition: opacity 120ms ease;
	}

	.tool-swatch-tick-visible {
		opacity: 1;
	}

	.tool-swatch:disabled {
		cursor: not-allowed;
		opacity: 0.45;
		transform: none;
	}

	.tool-swatch:disabled:hover {
		transform: none;
	}

	.dashboard-canvas {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 296 / 128;
		cursor: crosshair;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		touch-action: none;
		background:
			linear-gradient(to right, rgb(15 23 42 / 0.06) 1px, transparent 1px),
			linear-gradient(to bottom, rgb(15 23 42 / 0.06) 1px, transparent 1px);
		background-size: calc(100% / 37) calc(100% / 16);
	}

	.dashboard-preview {
		display: block;
		width: 100%;
		height: auto;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}

	@keyframes confetti-fall {
		0% {
			transform: translate3d(0, -8vh, 0) rotate(var(--confetti-rotate));
			opacity: 0;
		}

		10% {
			opacity: 1;
		}

		100% {
			transform: translate3d(1rem, 110vh, 0) rotate(calc(var(--confetti-rotate) + 260deg));
			opacity: 0;
		}
	}
</style>
