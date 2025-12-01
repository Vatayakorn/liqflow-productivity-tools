import { json } from '@sveltejs/kit';
import muhammara from 'muhammara';
import { Writable } from 'stream';

export async function POST({ request }) {
    try {
        console.log("Muhammara exports:", Object.keys(muhammara));
        const formData = await request.formData();
        const file = formData.get('file');
        const password = formData.get('password');

        if (!file || !password) {
            return json({ error: 'File and password are required' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a writable stream to capture the output
        const chunks = [];
        const writableStream = new Writable({
            write(chunk, encoding, callback) {
                chunks.push(chunk);
                callback();
            }
        });

        // Create a recipe to create a new encrypted PDF and copy pages
        const pdfWriter = muhammara.createWriter(
            new muhammara.PDFStreamForResponse(writableStream),
            {
                userPassword: password,
                ownerPassword: password,
                userProtectionFlag: 4 // Print allowed
            }
        );

        const copyingContext = pdfWriter.createPDFCopyingContext(
            new muhammara.PDFRStreamForBuffer(buffer)
        );

        const pageCount = copyingContext.getSourceDocumentParser().getPagesCount();
        for (let i = 0; i < pageCount; ++i) {
            copyingContext.appendPDFPageFromPDF(i);
        }

        pdfWriter.end();
        writableStream.end();

        const outputBuffer = Buffer.concat(chunks);

        return new Response(outputBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '-encrypted.pdf')}"`
            }
        });

    } catch (error) {
        console.error('Encryption error:', error);
        return json({ error: 'Failed to encrypt PDF' }, { status: 500 });
    }
}
