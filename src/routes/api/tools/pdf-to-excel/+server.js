import { json } from '@sveltejs/kit';
import ExcelJS from 'exceljs';
import PDFParser from 'pdf2json';

const Y_TOLERANCE = 0.8;
const X_TOLERANCE = 0.6;

function decodeText(raw) {
	try {
		return decodeURIComponent(raw);
	} catch (e) {
		return raw
			.replace(/%20/g, ' ')
			.replace(/%2C/gi, ',')
			.replace(/%2E/gi, '.')
			.replace(/%2F/gi, '/')
			.replace(/%3A/gi, ':');
	}
}

function clusterPositions(values, tolerance) {
	const sorted = [...values].sort((a, b) => a - b);
	const clusters = [];

	sorted.forEach((v) => {
		const cluster = clusters.find((c) => Math.abs(c.avg - v) < tolerance);
		if (cluster) {
			cluster.values.push(v);
			cluster.avg = cluster.values.reduce((a, b) => a + b, 0) / cluster.values.length;
		} else {
			clusters.push({ avg: v, values: [v] });
		}
	});

	return clusters.sort((a, b) => a.avg - b.avg);
}

/**
 * Convert a single PDF page's text items to rows of cells based on X/Y positions.
 */
function pageToRows(page) {
	if (!page.Texts || page.Texts.length === 0) return [];

	const items = page.Texts.flatMap((text) => {
		const content = text.R.map((r) => decodeText(r.T)).join('');
		if (!content.trim()) return [];
		return {
			x: text.x,
			y: text.y,
			content
		};
	});

	if (items.length === 0) return [];

	// Group into rows by Y
	items.sort((a, b) => a.y - b.y || a.x - b.x);
	/** @type {Array<typeof items>} */
	const rowGroups = [];
	let current = [];
	let currentY = null;

	for (const item of items) {
		if (currentY === null || Math.abs(item.y - currentY) < Y_TOLERANCE) {
			current.push(item);
			if (currentY === null) currentY = item.y;
		} else {
			rowGroups.push(current);
			current = [item];
			currentY = item.y;
		}
	}
	if (current.length) rowGroups.push(current);

	// Cluster X positions per page to align columns
	const xClusters = clusterPositions(items.map((i) => i.x), X_TOLERANCE);

	// Build rows
	const rows = rowGroups.map((group) => {
		group.sort((a, b) => a.x - b.x);
		const rowData = [];

		group.forEach((item) => {
			// find nearest cluster
			let bestIndex = 0;
			let minDiff = Infinity;
			xClusters.forEach((cluster, idx) => {
				const diff = Math.abs(cluster.avg - item.x);
				if (diff < minDiff) {
					minDiff = diff;
					bestIndex = idx;
				}
			});

			const colIndex = bestIndex;
			while (rowData.length <= colIndex) rowData.push(null);
			if (rowData[colIndex]) {
				rowData[colIndex] += ' ' + item.content;
			} else {
				rowData[colIndex] = item.content;
			}
		});

		return rowData;
	});

	return { rows, xClusters };
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('file');

		if (!file || !(file instanceof File)) {
			return json({ error: 'No file uploaded' }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Parse PDF structure with positions
		const pdfData = await new Promise((resolve, reject) => {
			const parser = new PDFParser();
			parser.on('pdfParser_dataError', (errData) => reject(errData?.parserError || errData));
			parser.on('pdfParser_dataReady', (data) => resolve(data));
			parser.parseBuffer(buffer);
		});

		if (!pdfData?.Pages?.length) {
			return json({ error: 'No pages found in PDF' }, { status: 400 });
		}

		const workbook = new ExcelJS.Workbook();

		pdfData.Pages.forEach((page, pageIdx) => {
			const sheet = workbook.addWorksheet(`Page ${pageIdx + 1}`);
			const result = pageToRows(page);

			if (!result || !result.rows || result.rows.length === 0) {
				sheet.addRow(['No text detected on this page.']);
				return;
			}

			result.rows.forEach((r) => sheet.addRow(r));

			// Set column widths based on spacing between clusters
			if (result.xClusters?.length) {
				const widths = [];
				for (let i = 0; i < result.xClusters.length; i++) {
					const current = result.xClusters[i];
					const next = result.xClusters[i + 1];
					const spacing = next ? Math.max(2, next.avg - current.avg) : 10;
					const excelWidth = Math.max(8, Math.min(80, Math.round(spacing * 1.5)));
					widths.push({ width: excelWidth });
				}
				sheet.columns = widths;
			}
		});

		const excelBuffer = await workbook.xlsx.writeBuffer();

		return new Response(excelBuffer, {
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'Content-Disposition': `attachment; filename="${encodeURIComponent(
					file.name.replace(/\.pdf$/i, '') || 'converted'
				)}.xlsx"`
			}
		});
	} catch (error) {
		console.error('Conversion error:', error);
		return json({ error: 'Failed to convert PDF to Excel' }, { status: 500 });
	}
}
