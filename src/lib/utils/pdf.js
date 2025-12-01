import { PDFDocument, degrees } from 'pdf-lib';

export async function mergePdfs(files) {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function rotatePdf(file, rotation = 90) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = pdf.getPages();

    pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
    });

    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function splitPdf(file) {
    // Simple split: save each page as a new PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const numberOfPages = pdf.getPageCount();
    const blobs = [];

    for (let i = 0; i < numberOfPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        const pdfBytes = await newPdf.save();
        blobs.push(new Blob([pdfBytes], { type: 'application/pdf' }));
    }

    return blobs;
}
