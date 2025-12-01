import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
    const lib = require('pdf-parse');
    console.log('PDFParse property type:', typeof lib.PDFParse);

    if (typeof lib.PDFParse === 'function') {
        console.log('Trying to instantiate PDFParse...');
        try {
            const instance = new lib.PDFParse();
            console.log('Instantiated successfully. Keys:', Object.keys(instance));
        } catch (e) {
            console.log('Instantiation failed:', e.message);
        }

        console.log('Trying to call PDFParse as function...');
        try {
            const result = lib.PDFParse();
            console.log('Called successfully. Result:', result);
        } catch (e) {
            console.log('Call failed:', e.message);
        }
    }
} catch (e) {
    console.error('Error:', e);
}
