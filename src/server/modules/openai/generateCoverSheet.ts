import { OpenAI } from "openai";

// Section types with string keys for prompts
export type SectionFields = Record<string, string>;

export interface RfpData {
	rfpIdentification: SectionFields;
	timeline: SectionFields;
	scope: SectionFields;
	submission: SectionFields;
	otherConsiderations: SectionFields;
	[key: string]: SectionFields; // Allow for any other sections
}

export const extractCoverSheet = async ({
	document,
}: {
	document: string;
}) => {
	const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	// Prompts for each field, grouped by section
	const fieldPrompts = {
		rfpIdentification: {
			"RFP issuer & short name": "Identify the full legal name of the issuing organization and create a 2-3 word internal reference name.",
			"RFP number & title": "Extract the complete RFP number, title, and classification codes from all sections of the document.",
			"Issuer contact info": "Extract all contact personnel details including names, titles, roles, phone numbers, and email addresses, noting any communication restrictions.",
			"Website/portal": "Locate all portal URLs, access credentials, and navigation paths required for document access and submission.",
			"Issuer description": "Summarize the issuing organization's background, mission, and strategic priorities as stated in the RFP."
		},
		timeline: {
			"Released": "Find the date RFP was released.",
			"Began review": "[User will input this information]",
			"Pre-proposal conference": "Identify all pre-proposal conference details including date, time, location, registration requirements, and attendance implications.",
			"Questions due": "Locate the question submission deadline, allowed formats, and any limitations on question quantity or content.",
			"Addenda issued by": "Please review the addendum at the end of the document and provide a concise summary of each page.",
			"Submissions due": "Find the submission deadline.",
			"Next step": "Create a complete submission and procurement timeline from release through award notification, including any post-submission activities.",
			"Amendments": "List all amendments and changes to the original RFP with their effective dates and content summaries."
		},
		scope: {
			"Objectives/goals": "Create a hierarchical list of all stated objectives, goals, and success criteria with page references.",
			"Minimum/mandatory requirements/qualifications": "Develop a complete compliance matrix of all mandatory requirements with exact RFP language, page references, and requirement type.",
			"Scope of work": "Generate a work breakdown structure (WBS) of all deliverables with specifications, acceptance criteria, and deadlines.",
			"Evaluation criteria": "Extract the complete evaluation methodology including criteria, sub-criteria, weights, scoring formulas, and minimum thresholds.",
			"Contract term": "Identify the base contract term, all option periods, extension conditions, and total potential contract duration.",
			"Pricing": "Determine the required pricing structure including units, volumes, periods, allowable adjustments, and prohibited costs.",
			"Budget": "Extract any stated or implied budget information, historical spending data, or 'not to exceed' language.",
			"Insurance": "Compile all insurance requirements including coverage types, amounts, deductible limits, provider qualifications, and proof timing.",
			"Bonds": "List all bond requirements."
		},
		submission: {
			"Submission instructions": "Document all submission instructions including method, format, quantity, packaging, delivery address, and deadline specifics.",
			"Proposal format/headings": "Create an exact document outline matching all required sections, subsections, and content elements in the specified order.",
			"Length/formatting restrictions": "Extract all formatting requirements including page limits by section, margins, fonts, spacing, header/footer specifications, and numbering conventions.",
			"Confidentiality": "Compile all confidentiality provisions, proprietary information protection procedures, and public disclosure requirements.",
			"Required forms, attachments": "Create an inventory of all required forms and attachments with their purposes, completion instructions, and signature/notarization requirements."
		},
		otherConsiderations: {
			"Set asides & mandates": "Does this RFP include any required set-asides or mandated allocations for particular business categories?",
			"Geographic preferences": "Does this RFP include any geographic preferences?",
			"Incumbent information": "Is there an incumbent vendor currently performing these services?"
		}
	};

	// Build the system prompt dynamically
	let systemPrompt = `You are a specialized RFP Parser Assistant. Analyze the provided RFP document and extract the following fields, grouped by section. For each field, follow the specific extraction instruction. Return a valid JSON object with the following structure (use the field names exactly as shown, including spaces and punctuation):\n\n`;
	systemPrompt += JSON.stringify(fieldPrompts, null, 2);
	systemPrompt += `\n\nExtraction Instructions:\n`;
	Object.entries(fieldPrompts).forEach(([section, fields]) => {
		systemPrompt += `\nSection: ${section}\n`;
		Object.entries(fields).forEach(([field, prompt]) => {
			systemPrompt += `- \"${field}\": ${prompt}\n`;
		});
	});
	systemPrompt += `\nGuidelines:\n- If a field is not present, return an empty string for that field.\n- Do not include any commentary or explanation, only the JSON object.\n- Dates should be in YYYY-MM-DD format.\n- Use semicolons (;) to separate multiple items within a field.\n- Include page references in parentheses at the end of content, if available.\n- ALWAYS use explicit labels for ALL information in the format "Label: Value".\n- CRITICAL: For ANY field that contains multiple pieces of information, use explicit labels for EACH piece.\n  Example: Instead of "City of Savannah; Savannah RFP", use "Organization: City of Savannah; Short name: Savannah RFP"\n  Example: Instead of "www.savannahga.gov; Proposers must be registered", use "Website: www.savannahga.gov; Registration: Proposers must be registered"\n- For detailed lists of requirements or criteria, always include an explicit label for each item.\n  Example: "Requirement 1: Heavy focus on social media; Requirement 2: Utilize carousel ads"\n- For numbered items like evaluation criteria, include the points as part of the label.\n  Example: "Qualifications (35 points): Description of what's required; Technical (20 points): Description"\n- For contact information, use detailed labels (e.g., "Organization: XYZ Corp; Email: contact@xyz.com; Phone: 555-123-4567").\n- Maintain proper JSON structure and formatting.\n`;
	systemPrompt += `\nCRITICAL INSTRUCTIONS:\n1. Do NOT include any markdown formatting like \`\`\`json or \`\`\` around your response\n2. Do NOT include any text outside of this JSON structure\n3. The response must be a raw JSON object that can be directly parsed\n4. Do not add any explanations, notes, or additional text\n`;

	const result = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: systemPrompt,
			},
			{
				role: "user",
				content: `Analyze the following RFP document and extract the required fields as specified.\n\n${document}\n\nReturn only the JSON object as described.`,
			},
		],
		temperature: 0.3,
	});

	return result.choices[0].message.content;
};
