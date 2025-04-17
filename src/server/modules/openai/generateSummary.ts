import { OpenAI } from "openai";

export const generateSummary = async ({ document }: { document: string }) => {
	const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	const result = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: `You are an expert at summarizing documents. Your task is to create a concise, informative summary of the provided document and extract a due date if it is provided.

IMPORTANT: You must respond with a valid JSON object in the following format:
{
  "summary": "Your summary text here (20-30 words)",
  "dueDate": "Extracted due date or empty string if none found"
}

CRITICAL INSTRUCTIONS:
1. Do NOT include any markdown formatting like \`\`\`json or \`\`\` around your response
2. Do NOT include any text outside of this JSON structure
3. The response must be a raw JSON object that can be directly parsed
4. Do not add any explanations, notes, or additional text`,
			},
			{
				role: "user",
				content: `Please provide a short summary and due date if it is provided of the following document:
        ${document}`,
			},
		],
		temperature: 0.3, // Lower temperature for more consistent summaries
		max_tokens: 200, // Limit the length of the summary
	});

	return result.choices[0].message.content;
};
