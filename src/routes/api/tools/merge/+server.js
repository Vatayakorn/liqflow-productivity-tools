import { PDFDocument } from 'pdf-lib';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files');

        if (!files || files.length < 2) {
            return json({ error: 'At least 2 files are required' }, { status: 400 });
        }

        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            if (typeof file === 'string') continue;
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();

        return new Response(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="merged-document.pdf"'
            }
        });
    } catch (error) {
        console.error('Merge error:', error);
        return json({ error: 'Failed to merge PDFs' }, { status: 500 });
    }
}
