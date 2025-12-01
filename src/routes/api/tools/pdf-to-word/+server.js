import { json } from '@sveltejs/kit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as pdfParseMod from 'pdf-parse';

// @ts-ignore - pdf-parse has different export formats
const pdfParse = pdfParseMod.default || pdfParseMod;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Read the PDF file
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF to extract text
        let pdfData;
        try {
            pdfData = await pdfParse(buffer);
        } catch (parseError) {
            console.error('PDF parse error:', parseError);
            return json({ error: 'Failed to parse PDF file' }, { status: 400 });
        }

        // Extract text content
        const text = pdfData.text || '';
        const lines = text.split('\n').filter((/** @type {string} */ line) => line.trim().length > 0);

        // Create paragraphs from extracted text
        const paragraphs = [];

        // Add title
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Converted from: ${file.name}`,
                        bold: true,
                        size: 28,
                    }),
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: {
                    after: 200,
                },
            })
        );

        // Add extracted content
        if (lines.length > 0) {
            // Group lines into paragraphs (simple heuristic: empty lines separate paragraphs)
            let currentParagraph = [];
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                if (trimmedLine.length > 0) {
                    currentParagraph.push(trimmedLine);
                } else if (currentParagraph.length > 0) {
                    // End of paragraph
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: currentParagraph.join(' '),
                                    size: 24,
                                }),
                            ],
                            spacing: {
                                after: 120,
                            },
                        })
                    );
                    currentParagraph = [];
                }
            }
            
            // Add remaining paragraph
            if (currentParagraph.length > 0) {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: currentParagraph.join(' '),
                                size: 24,
                            }),
                        ],
                        spacing: {
                            after: 120,
                        },
                    })
                );
            }
        } else {
            // No text extracted
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "No text content could be extracted from this PDF. The PDF may contain images or scanned content.",
                            size: 24,
                            italics: true,
                        }),
                    ],
                })
            );
        }

        // Add metadata
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `\nDocument Information:`,
                        bold: true,
                        size: 22,
                    }),
                ],
                spacing: {
                    before: 400,
                    after: 120,
                },
            })
        );

        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Pages: ${pdfData.numpages || 'Unknown'}`,
                        size: 20,
                    }),
                ],
            })
        );

        // Create document
        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs,
            }],
        });

        // Generate buffer
        const docBuffer = await Packer.toBuffer(doc);

        return new Response(new Uint8Array(docBuffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name.replace('.pdf', '.docx'))}"`
            }
        });

    } catch (error) {
        console.error('Conversion error:', error);
        return json({ error: 'Failed to convert PDF to Word' }, { status: 500 });
    }
}
