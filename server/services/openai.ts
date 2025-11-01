import OpenAI from "openai";
import { type AIWritingRequest, type AIWritingResponse } from "@shared/schema";

// Using OpenAI integration blueprint
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAIWritingAssistance(request: AIWritingRequest): Promise<AIWritingResponse> {
  const { content, action, tone = 'professional' } = request;

  let systemPrompt = '';
  let userPrompt = '';

  switch (action) {
    case 'improve':
      systemPrompt = `You are a professional writing editor. Improve the given text by fixing grammar, enhancing clarity, and making it more engaging. Maintain the original meaning and ${tone} tone.`;
      userPrompt = `Please improve this text:\n\n${content}`;
      break;
    
    case 'expand':
      systemPrompt = `You are a creative writing assistant. Expand the given text by adding more details, examples, and depth while maintaining a ${tone} tone.`;
      userPrompt = `Please expand this text with more details:\n\n${content}`;
      break;
    
    case 'summarize':
      systemPrompt = `You are a skilled summarizer. Create a concise summary of the given text while preserving key points and maintaining a ${tone} tone.`;
      userPrompt = `Please summarize this text:\n\n${content}`;
      break;
    
    default:
      systemPrompt = `You are a helpful writing assistant with a ${tone} tone.`;
      userPrompt = content;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_completion_tokens: 8192,
    });

    const suggestion = response.choices[0].message.content || '';

    return {
      suggestion,
      action,
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get AI assistance: ' + (error.message || 'Unknown error'));
  }
}
