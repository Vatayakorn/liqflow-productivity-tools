import { PDFDocument } from 'pdf-lib';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        // Get compression level from form data (default to medium)
        const compressionLevel = formData.get('level') || 'medium';

        // Configure save options based on compression level
        let saveOptions = {
            useObjectStreams: true, // Enable object streams for better compression
            addDefaultPage: false,
            objectsPerTick: 50
        };

        if (compressionLevel === 'high') {
            // Maximum compression - may take longer but produces smallest file
            saveOptions = {
                ...saveOptions,
                useObjectStreams: true
            };
        } else if (compressionLevel === 'low') {
            // Light compression - faster processing
            saveOptions = {
                ...saveOptions,
                useObjectStreams: false
            };
        }

        // Save the PDF with compression
        const compressedPdfBytes = await pdf.save(saveOptions);

        return new Response(compressedPdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="compressed-${file.name}"`
            }
        });
    } catch (error) {
        console.error('Compress error:', error);
        return json({ error: 'Failed to compress PDF' }, { status: 500 });
    }
}
