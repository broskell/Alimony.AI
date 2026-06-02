import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GenerateOptions {
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  systemInstruction?: string;
  maxOutputTokens?: number;
  temperature?: number;
  stream?: boolean;
  onChunk?: (text: string) => void;
}

export async function generateResponse(options: GenerateOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('Gemini API key is not configured');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: options.systemInstruction,
  });

  const maxTokens = options.maxOutputTokens || 1024;
  const temp = options.temperature !== undefined ? options.temperature : 0.3;

  if (options.messages && options.messages.length > 0) {
    // Chat context
    const lastMsg = options.messages[options.messages.length - 1];
    const firstUserIndex = options.messages.findIndex((m) => m.role === 'user');
    const filteredHistory = firstUserIndex !== -1 ? options.messages.slice(firstUserIndex, -1) : [];

    const history = filteredHistory.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));


    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temp,
      },
    });

    if (options.stream && options.onChunk) {
      const result = await chat.sendMessageStream(lastMsg.content);
      let fullText = '';
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullText += text;
          options.onChunk(text);
        }
      }
      return fullText;
    } else {
      const result = await chat.sendMessage(lastMsg.content);
      return result.response.text() || '';
    }
  } else {
    // Single prompt
    const promptText = options.prompt || '';
    if (options.stream && options.onChunk) {
      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temp,
        },
      });
      let fullText = '';
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullText += text;
          options.onChunk(text);
        }
      }
      return fullText;
    } else {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temp,
        },
      });
      return result.response.text() || '';
    }
  }
}
