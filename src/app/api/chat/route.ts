// import { openai } from "@ai-sdk/openai";
// import { jsonSchema, streamText } from "ai";
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export const runtime = "edge";
export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages, system, tools } = await req.json();

//   const result = streamText({
//     model: openai("gpt-4o"),
//     messages,
//     system,
//     tools: Object.fromEntries(
//       Object.entries<{ parameters: unknown }>(tools).map(([name, tool]) => [
//         name,
//         {
//           parameters: jsonSchema(tool.parameters!),
//         },
//       ]),
//     ),
//   });

//   const value = await result.toTextStreamResponse();
//   console.log(value, "value");
//   return value;
// }


export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { messages: { searchTerm, document } } = await req.json();

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that answers questions about PDF documents accurately and concisely. Please return all responses as valid HTML. Do not use Markdown backticks."
      },
      {
        role: "user",
        content: `PDF Content: ${document}\n\nQuestion: ${searchTerm}`
      }
    ],
    temperature: 0.7,

  });

  console.log(result, "value");
  return NextResponse.json({ data: result.choices[0].message.content });
}
