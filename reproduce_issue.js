import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import fs from 'fs';

async function testWatermark() {
    console.log("Testing Watermark...");
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const watermarkText = "TEST WATERMARK";

        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
            x: width / 4,
            y: height / 2,
            size: 32,
            font,
            color: rgb(0.8, 0, 0),
            rotate: degrees(-25),
        });

        const pdfBytes = await pdfDoc.save();
        console.log("Watermark success!");
    } catch (error) {
        console.error("Watermark failed:", error);
    }
}

async function testEncryption() {
    console.log("Testing Encryption...");
    try {
        const pdfDoc = await PDFDocument.create();
        pdfDoc.addPage();

        console.log("Trying save with password options...");
        // Attempt to save with encryption options directly
        const pdfBytes = await pdfDoc.save({
            userPassword: 'password',
            ownerPassword: 'password',
            permissions: {
                printing: 'highResolution',
                modifying: false,
                copying: false,
                annotating: false,
                fillingForms: false,
                contentAccessibility: false,
                documentAssembly: false,
            },
        });
        console.log("Encryption success via save options!");

    } catch (error) {
        console.error("Encryption failed:", error);
    }
}

async function testUnlock() {
    console.log("Testing Unlock...");
    try {
        // First create a PDF and try to encrypt it
        const pdfDoc = await PDFDocument.create();
        pdfDoc.addPage();
        const encryptedBytes = await pdfDoc.save({
            userPassword: 'password',
            ownerPassword: 'password',
        });

        // Check if it's actually encrypted by loading WITHOUT password
        try {
            console.log("Attempting to load 'encrypted' PDF WITHOUT password...");
            const loadedPdf = await PDFDocument.load(encryptedBytes);
            console.log("Load WITHOUT password succeeded! -> PDF IS NOT ENCRYPTED (FAILURE)");
            console.log("isEncrypted property:", loadedPdf.isEncrypted);
        } catch (e) {
            console.log("Load WITHOUT password failed! -> PDF IS ENCRYPTED (SUCCESS)");
            console.log("Error:", e.message);
        }

    } catch (error) {
        console.error("Unlock setup failed:", error);
    }
}

async function run() {
    // await testWatermark();
    // await testEncryption();
    await testUnlock();
}

run();
