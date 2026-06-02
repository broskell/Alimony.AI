import type { GenerateOptions } from './gemini.ts';

export async function generateResponse(options: GenerateOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('Groq API key is not configured');
  }

  const modelName = options.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const systemPrompt = options.systemInstruction || 'You are an Indian family law specialist AI assistant named Lex.';

  let formattedMessages: Array<{ role: string; content: string }> = [];

  if (options.messages && options.messages.length > 0) {
    formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...options.messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];
  } else {
    formattedMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: options.prompt || '' },
    ];
  }

  const maxTokens = options.maxOutputTokens || 1024;
  const temp = options.temperature !== undefined ? options.temperature : 0.3;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: formattedMessages,
      temperature: temp,
      max_tokens: maxTokens,
      stream: !!options.stream,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Groq API returned status ${res.status}: ${errorText}`);
  }

  if (options.stream && options.onChunk) {
    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('Groq response body reader is not available');
    }
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const chunk = json.choices?.[0]?.delta?.content || '';
            if (chunk) {
              fullText += chunk;
              options.onChunk(chunk);
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
    }
    return fullText;
  } else {
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }
}
