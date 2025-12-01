# 📄 LiqflowAdobe - PDF Tools Platform

A modern, full-featured PDF manipulation platform built with SvelteKit. LiqflowAdobe provides a comprehensive suite of tools for converting, compressing, merging, and editing PDF files with a clean, user-friendly interface.

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

## ✨ Features

### 🔄 Convert & Compress
- **Compress PDF** - Reduce PDF file size with configurable compression levels
- **PDF to Word** - Extract text and convert PDFs to Word documents (.docx)
- **PDF to Excel** - Convert PDFs to Excel spreadsheets with table detection
- **PDF to PPT** - Convert PDFs to PowerPoint presentations
- **PNG to PDF** - Convert PNG images to PDF format
- **JPG to PDF** - Convert JPG images to PDF format
- **PDF to JPG** - Convert PDF pages to JPG images
- **PDF to PNG** - Convert PDF pages to PNG images (single or all pages)
- **OCR PDF** - Recognize text in scanned PDFs

### 📝 Edit & Organize
- **Merge PDFs** - Combine multiple PDF files into one
- **Split PDF** - Separate one PDF into multiple files
- **Rotate PDF** - Rotate PDF pages
- **Delete Pages** - Remove specific pages from PDFs
- **Edit PDF** - Direct PDF editing capabilities

### 🔐 Sign & Protect
- **Fill & Sign** - Fill and sign PDF forms
- **Request e-signatures** - Send documents for digital signatures
- **Protect PDF** - Add password protection and watermarks

### 🔍 Additional Features
- **Search Functionality** - Quick search across all available tools
- **Real-time Processing** - Server-side PDF processing with instant results
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **pnpm** or **yarn**

### Installation

1. **Clone the repository**
```sh
git clone <repository-url>
cd LiqflowAdobe
```

2. **Install dependencies**
```sh
npm install
# or
pnpm install
# or
yarn install
```

3. **Start development server**
```sh
npm run dev
# or start and open in browser
npm run dev -- --open
```

The application will be available at `http://localhost:5173` (or the next available port).

## 🏗️ Project Structure

```
LiqflowAdobe/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable Svelte components
│   │   │   ├── Header.svelte    # Navigation header with search
│   │   │   ├── Footer.svelte    # Footer component
│   │   │   ├── ToolCard.svelte  # Tool card component
│   │   │   ├── ToolsGrid.svelte # Tools grid layout
│   │   │   └── ...
│   │   └── utils/               # Utility functions
│   │       └── pdf.js           # PDF processing utilities
│   ├── routes/
│   │   ├── +page.svelte         # Home page
│   │   ├── +layout.svelte       # Root layout
│   │   ├── api/
│   │   │   └── tools/           # API endpoints for PDF tools
│   │   │       ├── compress/
│   │   │       ├── merge/
│   │   │       ├── pdf-to-word/
│   │   │       ├── pdf-to-excel/
│   │   │       ├── pdf-to-png/
│   │   │       └── ...
│   │   ├── tool/                # Tool pages
│   │   │   ├── compress-pdf/
│   │   │   ├── merge-pdf/
│   │   │   ├── pdf-to-word/
│   │   │   └── ...
│   │   └── tools/               # All tools page
│   └── app.html                 # HTML template
├── static/                      # Static assets
│   ├── fonts/                   # Custom fonts (Sarabun for Thai support)
│   ├── logo.png
│   └── robots.txt
├── package.json
├── svelte.config.js
├── vite.config.js
└── README.md
```

## 📦 Key Dependencies

### Core Framework
- **SvelteKit** - Modern web framework
- **Vite** - Fast build tool

### PDF Processing
- **pdf-lib** (v1.17.1) - PDF manipulation and creation
- **pdf-parse** (v1.1.1) - PDF text extraction
- **pdfjs-dist** - Mozilla's PDF.js for rendering
- **pdf2json** - PDF parsing and structure analysis

### Document Processing
- **mammoth** - Word document (.docx) parsing
- **docx** (v9.5.1) - Word document creation
- **exceljs** (v4.4.0) - Excel spreadsheet creation

### Image Processing
- **canvas** - Server-side canvas for image generation
- **archiver** - ZIP file creation for batch exports

### UI Components
- **lucide-svelte** - Beautiful icon library

## 🛠️ Building for Production

Create an optimized production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## 🌐 Deployment

To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment:

- **Vercel**: `@sveltejs/adapter-vercel`
- **Netlify**: `@sveltejs/adapter-netlify`
- **Node.js**: `@sveltejs/adapter-node`
- **Static**: `@sveltejs/adapter-static`

## 📖 API Documentation

### Compress PDF
```
POST /api/tools/compress
Content-Type: multipart/form-data

Form Data:
- file: PDF file
- compressionLevel: 'low' | 'medium' | 'high' (optional)
```

### Merge PDF
```
POST /api/tools/merge
Content-Type: multipart/form-data

Form Data:
- files: Multiple PDF files
```

### PDF to Word
```
POST /api/tools/pdf-to-word
Content-Type: multipart/form-data

Form Data:
- file: PDF file
```

### PDF to Excel
```
POST /api/tools/pdf-to-excel
Content-Type: multipart/form-data

Form Data:
- file: PDF file
```

### PDF to PNG
```
POST /api/tools/pdf-to-png
Content-Type: multipart/form-data

Form Data:
- file: PDF file
- allPages: 'true' | 'false' (optional)
```

## 🎨 Features Highlights

### Search Functionality
- Real-time search across all tools
- Search by tool name or category
- Keyboard-friendly with auto-focus
- Beautiful overlay design with animations

### PDF Compression
- Multiple compression levels (low, medium, high)
- Maintains PDF quality while reducing file size
- Uses pdf-lib's advanced compression features

### PDF to Word/Excel
- Accurate text extraction
- Table detection in Excel conversion
- Multi-sheet support for Excel
- Preserves document structure

### PDF to PNG
- High-quality rendering at 2x scale
- Single page or all pages export
- ZIP archive for multi-page exports
- Automatic file cleanup

### Merge PDF
- Combine unlimited PDF files
- Maintains original quality
- Type-safe implementation

## 🌍 Internationalization

The platform includes support for Thai language through:
- **Sarabun Font** - Embedded Thai font for proper Unicode rendering
- Supports multiple languages in PDF conversion
- UTF-8 encoding throughout

## 🐛 Known Issues & Limitations

- Some complex PDF layouts may not convert perfectly to Word/Excel
- OCR functionality requires additional setup
- Large file processing may take time depending on server resources

## 📝 Development Notes

### Recent Updates
- ✅ Implemented functional PDF compression
- ✅ Added real PDF to Word conversion
- ✅ Added real PDF to Excel conversion with table detection
- ✅ Implemented PDF to PNG conversion (single/multiple pages)
- ✅ Added search functionality in header
- ✅ Removed unused tool stubs (Word to PDF, Excel to PDF, PPT to PDF)

### Code Quality
- TypeScript type checking enabled
- ESLint for code quality
- Svelte best practices followed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Lucide Icons](https://lucide.dev/)

## 💡 Tips

- For best results with PDF conversion, use high-quality source PDFs
- Compression level 'medium' is recommended for most use cases
- Use PNG format for better quality image exports from PDFs

---

Built with ❤️ using SvelteKit

