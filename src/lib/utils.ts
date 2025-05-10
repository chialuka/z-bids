import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';
import { RfpData, SectionFields } from '../server/modules/openai/generateCoverSheet';
/**
 * A utility function that combines multiple class names and resolves Tailwind CSS conflicts
 * 
 * @param inputs - Class names or conditional class name expressions to combine
 * @returns A merged string of class names with Tailwind conflicts resolved
 * 
 * @example
 * // Basic usage
 * cn('text-red-500', 'bg-blue-500')
 * 
 * @example
 * // With conditional classes
 * cn('text-lg', isLarge && 'font-bold', error ? 'text-red-500' : 'text-green-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 

// Converts JSON string to markdown format for frontend display
export const convertJsonToMarkdown = (jsonString: string): string => {
	try {
		const data = JSON.parse(jsonString) as RfpData;
		let markdown = `# RFP Cover Sheet\n\n`;

		// Create a single table with column headers
		markdown += `| :--- | :--- |\n`;

		// Process each section
		Object.entries(data).forEach(([section, content]) => {
			// Format the section name nicely
			const formattedSectionName = section
				.replace(/([A-Z])/g, ' $1')
				.replace(/^./, str => str.toUpperCase());
			
			// Add section header with clear visual separator (bold, all caps)
			markdown += `| **${formattedSectionName.toUpperCase()}** | |\n`;
			
			// Add the fields and values
			Object.entries(content as SectionFields).forEach(([key, value]) => {
				// Handle empty values
				const displayValue = value.trim() ? value : "N/A";
				
				// Escape any pipe characters in the text to prevent breaking the table structure
				const safeValue = displayValue.replace(/\|/g, "\\|");
				
				// Handle semicolons for lists using multiple rows instead of line breaks
				if (safeValue.includes(';')) {
					const items = safeValue.split(';').map(item => item.trim()).filter(Boolean);
					
					if (items.length > 1) {
						// First item goes in the main row
						markdown += `| ${key} | ${items[0]} |\n`;
						
						// Subsequent items get their own rows with empty first column
						for (let i = 1; i < items.length; i++) {
							markdown += `| | ${items[i]} |\n`;
						}
					} else {
						markdown += `| ${key} | ${safeValue} |\n`;
					}
				} else {
					markdown += `| ${key} | ${safeValue} |\n`;
				}
			});
			
			// Add an empty row after each section for better spacing
			markdown += `| | |\n`;
		});

		return markdown;
	} catch (error) {
		console.error('Error converting JSON to markdown:', error);
		return '';
	}
};

// Converts JSON string to Excel file format (XLSX)
export const convertToExcel = async (jsonString: string): Promise<Uint8Array> => {
	try {
		const data = JSON.parse(jsonString) as RfpData;
		const rows: (string[])[] = [];
		
		// Add title row
		rows.push(["RFP Cover Sheet", ""]);
		
		// Add a blank row
		rows.push(["", ""]);
		
		// Process each section
		Object.entries(data).forEach(([section, content]) => {
			// Format the section name nicely
			const formattedSection = section
				.replace(/([A-Z])/g, ' $1')
				.replace(/^./, str => str.toUpperCase());
			
			// Add a section header row
			rows.push([formattedSection, ""]);
			
			// Add the fields and values
			Object.entries(content as SectionFields).forEach(([key, value]) => {
				rows.push([key, value || 'N/A']);
			});
			
			// Add a blank row between sections
			rows.push(["", ""]);
		});

		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.aoa_to_sheet(rows);
		
		// Set column widths
		ws['!cols'] = [
			{ wch: 40 }, // Field column width
			{ wch: 100 } // Value column width
		];
		
		// Apply cell styling using cell addresses
		// Title (A1)
		if (!ws.A1) ws.A1 = { v: "RFP Cover Sheet" };
		ws.A1.s = { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" } };
		
		// Header row (A3:B3)
		ws.A3.s = { font: { bold: true }, fill: { fgColor: { rgb: "EFEFEF" } } };
		ws.B3.s = { font: { bold: true }, fill: { fgColor: { rgb: "EFEFEF" } } };
		
		// Get merged cell ranges
		const merges = [
			// Merge title across columns
			{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
		];
		
		// Add section header merges and styling
		let rowIndex = 3; // Start after headers
		
		Object.keys(data).forEach(section => {
			const sectionContent = data[section as keyof RfpData] as SectionFields;
			rowIndex += 1; // Move to section row
			
			// Style section header
			const sectionCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
			if (ws[sectionCellRef]) {
				ws[sectionCellRef].s = { 
					font: { bold: true, color: { rgb: "0000AA" } },
					fill: { fgColor: { rgb: "E6E6FF" } }
				};
			}
			
			// Merge section header across both columns
			merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 1 } });
			
			// Skip the content rows
			rowIndex += Object.keys(sectionContent).length;
			
			// Skip the blank row
			rowIndex += 1;
		});
		
		// Apply merges
		ws["!merges"] = merges;
		
		XLSX.utils.book_append_sheet(wb, ws, "RFP Cover Sheet");
		const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
		return new Uint8Array(excelBuffer);
	} catch (error) {
		console.error('Error converting JSON to Excel:', error);
		throw error;
	}
};

export const convertMarkdownTableToExcel = async (markdownString: string): Promise<Uint8Array> => {
	try {
		// Initialize XLSX workbook
		const wb = XLSX.utils.book_new();
		
		// Split the markdown into lines for processing
		const lines = markdownString.split('\n');
		
		// Extract the summary (everything before the table)
		const summaryLines = [];
		let tableStartIndex = -1;
		
		// Find where the table starts
		for (let i = 0; i < lines.length; i++) {
			// Look for a line that starts with | and contains multiple |
			// This is likely the header row of a markdown table
			if (lines[i].trim().startsWith('|') && lines[i].includes('|')) {
				tableStartIndex = i;
				break;
			}
			// Add non-empty lines to summary
			if (lines[i].trim()) {
				summaryLines.push(lines[i]);
			}
		}
		
		// Create a summary worksheet
		const summarySheet = XLSX.utils.aoa_to_sheet([["Compliance Matrix Summary"]]);
		
		// Add summary content as rows
		XLSX.utils.sheet_add_aoa(summarySheet, 
			summaryLines.map(line => {
				// Clean up markdown formatting
				return [line.replace(/^#+\s+/, '').replace(/\*\*/g, '')];
			}), 
			{ origin: "A2" }
		);
		
		// Set column width for summary
		summarySheet['!cols'] = [{ wch: 100 }];
		
		// Add the summary sheet to workbook
		XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
		
		// If table was found, create the main table worksheet
		if (tableStartIndex >= 0 && tableStartIndex < lines.length) {
			// Extract table data
			const tableData = [];
			
			// Process header row
			const headerRow = lines[tableStartIndex];
			const headers = headerRow.split('|')
				.map(cell => cell.trim())
				.filter(cell => cell.length > 0);
			
			// Add headers as first row of table data
			tableData.push(headers);
			
			// Skip the separator row (typically |---|---|...)
			// Process data rows (all rows after the separator row)
			for (let i = tableStartIndex + 2; i < lines.length; i++) {
				const line = lines[i].trim();
				
				// Only process lines that look like table rows
				if (line.startsWith('|') && line.includes('|')) {
					const cells = line.split('|')
						.map(cell => cell.trim())
						.filter(cell => cell.length > 0);
					
					// Only add rows with data
					if (cells.length > 0) {
						tableData.push(cells);
					}
				}
			}
			
			// Only create table sheet if we have data
			if (tableData.length > 1) { // Header + at least one data row
				const tableSheet = XLSX.utils.aoa_to_sheet(tableData);
				
				// Set appropriate column widths
				tableSheet['!cols'] = [
					{ wch: 5 },  // Page
					{ wch: 15 }, // Section
					{ wch: 50 }, // Requirement Text
					{ wch: 15 }, // Obligation Verb
					{ wch: 15 }, // Obligation Level
					{ wch: 20 }, // Cross-References
					{ wch: 30 }  // Human Review Flag
				];
				
				// Format the header row
				const headerRange = XLSX.utils.decode_range(tableSheet['!ref'] || "A1");
				for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
					const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
					if (!tableSheet[headerCell]) continue;
					
					tableSheet[headerCell].s = {
						font: { bold: true },
						fill: { fgColor: { rgb: "E6E6E6" } }
					};
				}
				
				// Add the table sheet to workbook
				XLSX.utils.book_append_sheet(wb, tableSheet, "Requirements");
			}
		}
		
		// Write the workbook to buffer and return
		const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
		return new Uint8Array(excelBuffer);
	} catch (error) {
		console.error('Error converting markdown table to Excel:', error);
		throw error;
	}
};
