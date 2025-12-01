import { json } from '@sveltejs/kit';
import PptxGenJS from 'pptxgenjs';
import { PDFParse } from 'pdf-parse';

const MAX_BULLETS_PER_SLIDE = 8;
const MAX_TOTAL_BULLETS = 48;
const MAX_CHARS_PER_BULLET = 200;

/**
 * Split a block of text into concise bullet strings.
 * Long sentences are broken into chunks to keep slides readable.
 */
function buildBullets(text /** @type {string} */) {
	// Normalize whitespace and split into sentence-like chunks
	const normalized = text.replace(/\s+/g, ' ').trim();
	if (!normalized) return [];

	const sentenceBlocks = normalized
		.replace(/([.!?])\s+/g, '$1\n')
		.split(/\n+/)
		.map((chunk /** @type {string} */) => chunk.trim())
		.filter(Boolean);

	const bullets = [];

	for (const block of sentenceBlocks) {
		const pieces = splitLongText(block, MAX_CHARS_PER_BULLET);
		for (const piece of pieces) {
			bullets.push(piece);
			if (bullets.length >= MAX_TOTAL_BULLETS) {
				return bullets;
			}
		}
	}

	if (bullets.length === 0) {
		bullets.push(normalized.slice(0, MAX_CHARS_PER_BULLET));
	}

	return bullets;
}

/**
 * Break a long string into segments without exceeding maxLength.
 */
function splitLongText(text /** @type {string} */, maxLength /** @type {number} */) {
	if (text.length <= maxLength) return [text];

	const words = text.split(' ');
	const segments = [];
	let current = '';

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;
		if (candidate.length <= maxLength) {
			current = candidate;
		} else {
			if (current) segments.push(current);
			current = word;
		}
	}

	if (current) segments.push(current);

	return segments;
}

/** @template T */
function chunkArray(array /** @type {T[]} */, size /** @type {number} */) {
	const chunks = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('file');

		if (!file || typeof file === 'string') {
			return json({ error: 'No file uploaded' }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Capture page-by-page text so we can create one slide per page
		const parser = new PDFParse({ data: buffer, verbosity: 0 });
		const textResult = await parser.getText();
		await parser.destroy?.();

		/** @type {string[]} */
		const pageTexts = textResult?.pages?.map((page) => page?.text || '') ?? [];
		const totalPages = textResult?.total ?? pageTexts.length ?? 'Unknown';

		const hasAnyText = pageTexts.some((text) => text && text.trim().length > 0);

		// Fallback to aggregated text if page-level parsing yielded nothing
		if (!hasAnyText && textResult?.text) {
			pageTexts.push(textResult.text);
		}

		const pptx = new PptxGenJS();
		pptx.layout = 'LAYOUT_16x9';

		// Title slide with quick metadata
		const titleSlide = pptx.addSlide();
		titleSlide.addText('PDF to PowerPoint', {
			x: 0.6,
			y: 1,
			w: 9,
			fontSize: 32,
			bold: true,
			color: '1b1b1b'
		});
		titleSlide.addText(file.name, {
			x: 0.6,
			y: 2,
			w: 9,
			fontSize: 18,
			color: '374151'
		});
		titleSlide.addText(`Pages detected: ${totalPages}`, {
			x: 0.6,
			y: 2.6,
			w: 9,
			fontSize: 14,
			color: '4b5563'
		});
		titleSlide.addText('Slides are auto-generated from PDF text. Scanned PDFs may require OCR.', {
			x: 0.6,
			y: 3.1,
			w: 9,
			fontSize: 12,
			color: '6b7280'
		});

		if (pageTexts.length === 0) {
			const slide = pptx.addSlide();
			slide.addText('No text could be extracted', {
				x: 0.8,
				y: 1.5,
				w: 8.5,
				fontSize: 26,
				bold: true,
				color: '1f2937'
			});
			slide.addText('This PDF may be image-based (scanned). Try the OCR tool to unlock text before exporting to PowerPoint.', {
				x: 0.8,
				y: 2.4,
				w: 8.5,
				h: 2.5,
				fontSize: 16,
				color: '374151'
			});
		} else {
			pageTexts.forEach((pageText, index) => {
				const bullets = buildBullets(pageText);
				const bulletChunks = chunkArray(bullets.length ? bullets : ['No text found on this page.'], MAX_BULLETS_PER_SLIDE);

				bulletChunks.forEach((chunk, chunkIndex) => {
					const slide = pptx.addSlide();
					const subtitle = bulletChunks.length > 1 ? ` (part ${chunkIndex + 1})` : '';

					slide.addText(`Page ${index + 1}${subtitle}`, {
						x: 0.6,
						y: 0.7,
						w: 9,
						fontSize: 22,
						bold: true,
						color: '111827'
					});

					const bulletObjects = chunk.map((line /** @type {string} */) => ({
						text: line.trim(),
						options: { bullet: true }
					}));

					slide.addText(bulletObjects, {
						x: 0.8,
						y: 1.5,
						w: 8.5,
						h: 5,
						fontSize: 18,
						color: '1f2937',
						lineSpacing: 28
					});
				});
			});
		}

		const pptBuffer = /** @type {Uint8Array} */ (
			await pptx.write({ outputType: 'uint8array' })
		);
		const outputName = `${file.name.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9-_.]/g, '_') || 'converted'}.pptx`;

		return new Response(pptBuffer, {
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
				'Content-Disposition': `attachment; filename="${encodeURIComponent(outputName)}"`
			}
		});
	} catch (error) {
		console.error('PDF to PPT conversion error:', error);
		return json({ error: 'Failed to convert PDF to PowerPoint' }, { status: 500 });
	}
}
