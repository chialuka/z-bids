import { OpenAI } from "openai";

export const extractComplianceMatrix = async ({
	document,
}: {
	document: string;
}) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	const result = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: `
          You are an expert in analyzing and shredding RFP (Request for Proposal) documents. Your task is to extract all key details and format them into a structured **compliance matrix**, as an RFP writer would do manually.  Please return all responses as valid HTML. Do not use Markdown backticks.
    
          **Guidelines:**
          - The provided document is unstructured text from a PDF.
          - Your job is to **identify and extract** all relevant sections and present them **clearly**.
          - Extract **explicit and implicit** compliance requirements.
          - Organize the information under the correct **headings and subheadings**.
          - Format the output as a **well-structured compliance matrix**.
    
          **How to Format the Output:**
          
          **1️ RFP IDENTIFICATION**
          - **RFP Identifier:** Extract the unique ID (e.g., RFP#: 12345-A).
          - **Classification Codes:** Capture codes like NAICS, PSC (e.g., [NAICS: 541512]).
          - **Issuing Organization:** Provide the full legal name, parent org, department, and division if available.
          - **Contact Personnel:** List all key contacts with name, title, role, phone, email.
    
          **2️ TIMELINE**
          - **Key Events:** Provide a timeline of important dates (e.g., submission deadlines, pre-proposal meetings).
          - **Addenda & Amendments:** List all scheduled updates and deadline changes.
    
          **3️ COMPLIANCE MATRIX (Main Table)**
          Extract all RFP requirements and organize them into a table like this:
    
          | **Requirement ID** | **Requirement Description** | **Requirement Type** | **Evaluation Criteria** | **Compliance Level** | **Proof Required** | **Page Ref** | **Notes** |
          |--------------------|----------------------------|----------------------|-------------------------|----------------------|-------------------|-------------|--------|
          | REQ-001           | Vendor must provide cybersecurity certification (e.g., SOC 2). | Mandatory | Security Compliance | Meets / Partially Meets / Does Not Meet | SOC 2 Certification | Page 12 | Vendor must submit a valid certificate. |
          | REQ-002           | Proposal must not exceed 50 pages. | Mandatory | Formatting Compliance | Meets / Partially Meets / Does Not Meet | Document Review | Page 20 | Font must be Arial 11pt. |
          | REQ-003           | Provide past performance references. | Desirable | Experience & Past Performance | Meets / Partially Meets / Does Not Meet | Client References | Page 25 | Minimum 3 references required. |
    
          **4️ CONTRACT TERMS & PRICING**
          - **Contract Duration:** Base term length, option periods, maximum duration.
          - **Pricing Structure:** Fixed, T&M, Unit pricing models.
          - **Budget:** Explicit vs. implied budgets, spending caps.
    
          **5️ SUBMISSION REQUIREMENTS**
          - **Submission Method:** Electronic vs. physical, required formats.
          - **Required Documents:** List of forms, certifications, signatures.
    
          **6️ GO/NO-GO ASSESSMENT**
          - Identify risks, gaps, and potential compliance issues.
    
          **7️ CLARIFICATION NEEDS**
          - List unclear or contradictory RFP requirements.
    
          **Instructions:** 
          - **Analyze the provided text.**
          - **Extract information according to this format.**
          - **Structure the output cleanly so it can be used directly by proposal teams.**
          - **Do not include explanations—only return the extracted compliance matrix.**
          `,
			},
			{
				role: "user",
				content: `
          **Extract a compliance matrix from the following unstructured RFP document:**
          
          \n\n${document}
    
          **Format the response clearly as described above.**
          `,
			},
		],
		temperature: 0.3, // Lower temperature for accuracy
	});

	return result.choices[0].message.content;
};
