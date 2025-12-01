import { json } from '@sveltejs/kit';
import { PDFParse } from 'pdf-parse';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import JSZip from 'jszip';

const JPG_QUALITY = 0.9;

/** Convert a PNG buffer into JPEG Uint8Array using canvas */
async function pngBufferToJpeg(buffer) {
	const image = await loadImage(buffer);
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0);
	return canvas.toBuffer('image/jpeg', { quality: JPG_QUALITY });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('file');

		if (!file || !(file instanceof File)) {
			return json({ error: 'No PDF uploaded' }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const parser = new PDFParse({ data: buffer, verbosity: 0 });
		const screenshot = await parser.getScreenshot({
			scale: 1.5,
			imageBuffer: true,
			imageDataUrl: false
		});
		await parser.destroy?.();

		if (!screenshot?.pages?.length) {
			return json({ error: 'No pages found in PDF' }, { status: 400 });
		}

		const pageImages = screenshot.pages;
		const jpegBuffers = [];

		for (const page of pageImages) {
			const pngBuffer = page.data instanceof Uint8Array ? page.data : new Uint8Array(page.data);
			const jpg = await pngBufferToJpeg(pngBuffer);
			jpegBuffers.push(jpg);
		}

		if (jpegBuffers.length === 1) {
			const jpgBuffer = jpegBuffers[0];
			const filename = `${file.name.replace(/\\.pdf$/i, '') || 'page-1'}.jpg`;

			return new Response(jpgBuffer, {
				headers: {
					'Content-Type': 'image/jpeg',
					'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`
				}
			});
		}

		// Multiple pages: bundle into a zip
		const zip = new JSZip();
		jpegBuffers.forEach((buf, idx) => {
			zip.file(`page-${idx + 1}.jpg`, buf);
		});

		const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
		const zipName = `${file.name.replace(/\\.pdf$/i, '') || 'pdf-pages'}-jpg.zip`;

		return new Response(zipBuffer, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${encodeURIComponent(zipName)}"`
			}
		});
	} catch (error) {
		console.error('PDF to JPG conversion error:', error);
		return json({ error: 'Failed to convert PDF to JPG' }, { status: 500 });
	}
}
