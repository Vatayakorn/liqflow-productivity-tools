import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function verifyEncryption() {
    console.log("Verifying Server-Side Encryption...");
    try {
        // Create a dummy PDF to upload
        const pdfDoc = await PDFDocument.create();
        pdfDoc.addPage();
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        const formData = new FormData();
        formData.append('file', blob, 'test.pdf');
        formData.append('password', 'password');

        console.log("Sending request to API...");
        const response = await fetch('http://localhost:5173/api/tools/encrypt-pdf', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API failed with status ${response.status}: ${await response.text()}`);
        }

        const encryptedBuffer = await response.arrayBuffer();
        console.log("Received response, checking encryption...");

        // Verify it's encrypted by trying to load without password
        try {
            await PDFDocument.load(encryptedBuffer);
            console.error("FAILURE: PDF loaded without password! It is NOT encrypted.");
        } catch (e) {
            console.log("SUCCESS: PDF failed to load without password. It IS encrypted.");
        }

    } catch (error) {
        console.error("Verification failed:", error);
    }
}

verifyEncryption();
