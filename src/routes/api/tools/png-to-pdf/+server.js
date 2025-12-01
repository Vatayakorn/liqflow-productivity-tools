import { json } from '@sveltejs/kit';
import { PDFDocument } from 'pdf-lib';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const formData = await request.formData();

		/** @type {File[]} */
		const files = [
			...formData.getAll('files').filter((item) => item instanceof File),
			...(() => {
				const single = formData.get('file');
				return single && single instanceof File ? [single] : [];
			})()
		];

		if (files.length === 0) {
			return json({ error: 'No PNG uploaded' }, { status: 400 });
		}

		const pngs = files.filter(
			(file) =>
				file.type.toLowerCase().includes('png') || file.name.toLowerCase().endsWith('.png')
		);

		if (pngs.length === 0) {
			return json({ error: 'Only PNG files are supported' }, { status: 400 });
		}

		const pdfDoc = await PDFDocument.create();

		for (const file of pngs) {
			const arrayBuffer = await file.arrayBuffer();
			const pngImage = await pdfDoc.embedPng(arrayBuffer);
			const pngDims = pngImage.scale(1);

			const page = pdfDoc.addPage([pngDims.width, pngDims.height]);
			page.drawImage(pngImage, {
				x: 0,
				y: 0,
				width: pngDims.width,
				height: pngDims.height
			});
		}

		const pdfBytes = await pdfDoc.save();
		const fileName =
			pngs.length === 1
				? `${pngs[0].name.replace(/\.png$/i, '')}.pdf`
				: `png-images-${pngs.length}.pdf`;

		const body = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);

		return new Response(body, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`
			}
		});
	} catch (error) {
		console.error('PNG to PDF conversion error:', error);
		return json({ error: 'Failed to convert PNG to PDF' }, { status: 500 });
	}
}
