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
