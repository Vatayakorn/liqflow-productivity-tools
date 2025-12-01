import { json } from '@sveltejs/kit';
import muhammara from 'muhammara';
import { Writable, Readable } from 'stream';

/**
 * Helper to create a readable stream from a buffer
 * @param {Buffer} buffer
 */
function bufferToStream(buffer) {
	const stream = new Readable();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

/**
 * Helper to capture muhammara output into a buffer
 */
class BufferWritable extends Writable {
	constructor() {
		super();
		/** @type {Buffer[]} */
		this.chunks = [];
	}

	/**
	 * @param {any} chunk
	 * @param {string} encoding
	 * @param {function} callback
	 */
	_write(chunk, encoding, callback) {
		this.chunks.push(chunk);
		callback();
	}

	getBuffer() {
		return Buffer.concat(this.chunks);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('file');
		const passwordVal = formData.get('password');
		const password = typeof passwordVal === 'string' ? passwordVal : '';

		if (!file || !(file instanceof File)) {
			return json({ error: 'No PDF uploaded' }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const inputBuffer = Buffer.from(arrayBuffer);

		// Create streams
		const outputStream = new BufferWritable();

		try {
			// Initialize PDF Writer
			const pdfWriter = muhammara.createWriter(new muhammara.PDFStreamForResponse(outputStream));

			// Create copying context - this is where decryption happens
			// muhammara handles decryption automatically if password is provided in the second argument options
			// or if the file is not encrypted.

			let copyingContext;
			try {
				// Try to create context. If encrypted and no/wrong password, this might fail or subsequent operations will fail.
				// createPDFCopyingContext is a method of the writer instance
				copyingContext = pdfWriter.createPDFCopyingContext(
					new muhammara.PDFRStreamForBuffer(inputBuffer),
					{ password: password }
				);
			} catch (e) {
				// If it fails, it might be due to wrong password
				console.error('Error creating copying context:', e);
				return json({ error: 'Incorrect password or unable to open PDF.' }, { status: 400 });
			}

			// Get source document parser to check page count
			const sourceParser = copyingContext.getSourceDocumentParser();
			const pageCount = sourceParser.getPagesCount();

			// Copy all pages
			for (let i = 0; i < pageCount; i++) {
				copyingContext.appendPDFPageFromPDF(i);
			}

			// Finalize
			pdfWriter.end();
			outputStream.end();

			const outputBuffer = outputStream.getBuffer();
			const filename = file.name.replace(/\.pdf$/i, '') + '-unlocked.pdf';

			return new Response(outputBuffer, {
				headers: {
					'Content-Type': 'application/pdf',
					'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`
				}
			});

		} catch (err) {
			console.error('Muhammara unlock error:', err);
			return json(
				{ error: 'Failed to unlock PDF. Please check the password.' },
				{ status: 400 }
			);
		}

	} catch (error) {
		console.error('Unlock PDF error:', error);
		return json({ error: 'Failed to unlock PDF' }, { status: 500 });
	}
}
