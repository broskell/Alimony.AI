import { generateResponse as geminiGenerate } from './providers/gemini.ts';
import type { GenerateOptions } from './providers/gemini.ts';

import { generateResponse as groqGenerate } from './providers/groq.ts';
import { generateResponse as fallbackGenerate } from './providers/fallback.ts';


export async function generateResponse(options: GenerateOptions): Promise<string> {
  // 1. Try Gemini
  try {
    console.log('AI Orchestrator: Trying Gemini (gemini-2.5-flash)...');
    return await geminiGenerate({ ...options, model: 'gemini-2.5-flash' });
  } catch (geminiError: any) {
    console.error('AI Orchestrator: Gemini failed:', geminiError.message || geminiError);

    // If streaming, notify client of failover
    if (options.stream && options.onChunk) {
      options.onChunk('\n\n*AI service temporarily busy. Switching providers...*\n\n');
    }

    // 2. Try Groq (Llama 3.3 70B)
    try {
      console.log('AI Orchestrator: Trying Groq Llama 3.3 70B (llama-3.3-70b-versatile)...');
      return await groqGenerate({ ...options, model: 'llama-3.3-70b-versatile' });
    } catch (llamaError: any) {
      console.error('AI Orchestrator: Groq Llama 70B failed:', llamaError.message || llamaError);

      // If streaming, notify client of next failover
      if (options.stream && options.onChunk) {
        options.onChunk('\n\n*Switching to DeepSeek backup...*\n\n');
      }

      // 3. Try Groq (DeepSeek R1)
      try {
        console.log('AI Orchestrator: Trying Groq DeepSeek R1 (deepseek-r1-distill-llama-70b)...');
        return await groqGenerate({ ...options, model: 'deepseek-r1-distill-llama-70b' });
      } catch (deepseekError: any) {
        console.error('AI Orchestrator: Groq DeepSeek R1 failed:', deepseekError.message || deepseekError);

        // 4. Try Fallback
        console.log('AI Orchestrator: Falling back to Local Canned Responses...');
        if (options.stream && options.onChunk) {
          options.onChunk('\n\n*Running in offline fallback mode...*\n\n');
        }
        return await fallbackGenerate(options);
      }
    }
  }
}
export { GenerateOptions };
