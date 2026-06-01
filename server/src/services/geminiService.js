import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM = `You are an Indian family law specialist AI assistant named Lex.
You specialize in: Hindu Marriage Act 1955, CrPC Section 125, Protection of Women from DV Act 2005,
Hindu Adoption & Maintenance Act 1956, Special Marriage Act 1954.
You cite specific sections and Supreme Court precedents (especially Rajnesh v. Neha 2020).
You speak in clear, empathetic language. You always remind users to consult a licensed advocate.
You are familiar with court procedures in Delhi HC, Bombay HC, Madras HC, Telangana HC.
Current year: 2024. Always cite actual case law when relevant.`;

let genAI = null;

function getModel(systemExtra = '') {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'your_key_here') return null;
  if (!genAI) genAI = new GoogleGenerativeAI(key);
  const instruction = systemExtra ? `${SYSTEM}\n${systemExtra}` : SYSTEM;
  return genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: instruction,
  });
}

function fallbackResponse(type, context) {
  const fallbacks = {
    chat: `Based on Indian family law principles, ${context?.lastMessage || 'your question'} relates to maintenance under the Hindu Marriage Act and CrPC Section 125. Courts consider income disparity, marriage duration, and standard of living per Rajnesh v. Neha (2020). Please consult a licensed advocate for case-specific advice.`,
    analyze: JSON.stringify({
      summary: 'Case involves matrimonial maintenance under HMA and CrPC 125.',
      risks: ['Income proof may be challenged', 'Interim order timeline varies by court'],
      recommendations: ['Gather 3 years income tax returns', 'Document marriage expenses'],
      applicableActs: ['HMA 1955', 'CrPC Section 125'],
      strengthScore: 65,
    }),
    draft: 'IN THE COURT OF THE DISTRICT JUDGE AT [CITY]\n\nPETITION FOR MAINTENANCE UNDER SECTION 25, HINDU MARRIAGE ACT 1955\n\n[Draft generated offline — configure GEMINI_API_KEY for full AI drafting]',
    explain: 'This section empowers courts to grant maintenance considering the financial capacity of both parties and the needs of the applicant, guided by Supreme Court precedents including Rajnesh v. Neha (2020).',
    brief: 'This precedent establishes guidelines for determining maintenance quantum based on income disparity and standard of living.',
    recommendation: 'Your maintenance claim appears moderately strong given typical High Court factors. Document all income sources and consider interim relief under Section 24 HMA. Risk: opposing party may understate income — seek discovery. Consult a matrimonial law advocate in your jurisdiction.',
  };
  return fallbacks[type] || fallbacks.chat;
}

async function complete(prompt, maxOutputTokens = 1024, systemExtra = '') {
  // Try Groq first
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey !== 'your_key_here') {
    try {
      const systemPrompt = systemExtra ? `${SYSTEM}\n${systemExtra}` : SYSTEM;
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: maxOutputTokens,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
      } else {
        console.error('Groq completion response error status:', res.status);
      }
    } catch (e) {
      console.error('Groq completion failed:', e);
    }
  }

  // Fall back to Gemini
  const model = getModel(systemExtra);
  if (!model) return fallbackResponse('chat', { lastMessage: prompt.slice(0, 100) });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens },
  });
  return result.response.text() || '';
}

export async function analyzeCase(caseDescription) {
  const prompt = `Analyze this Indian family law case and respond ONLY with valid JSON:
{ "summary": "", "risks": [], "recommendations": [], "applicableActs": [], "strengthScore": 0-100 }
Case: ${caseDescription}`;

  const text = await complete(prompt, 800);
  try {
    const json = text.match(/\{[\s\S]*\}/);
    return JSON.parse(json ? json[0] : text);
  } catch {
    return JSON.parse(fallbackResponse('analyze'));
  }
}

export async function chatWithLawyer(messages, userContext = '') {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey !== 'your_key_here') {
    try {
      const systemPrompt = userContext ? `${SYSTEM}\nUser context: ${userContext}` : SYSTEM;
      const history = messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history
          ],
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
      }
    } catch (e) {
      console.error('Groq chatWithLawyer failed:', e);
    }
  }

  const model = getModel(userContext ? `User context: ${userContext}` : '');
  if (!model) {
    const last = messages.filter((m) => m.role === 'user').pop();
    return fallbackResponse('chat', { lastMessage: last?.content });
  }

  const last = messages.at(-1);
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(last?.content || '');
  return result.response.text() || '';
}

export async function streamChat(messages, userContext, onChunk) {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey !== 'your_key_here') {
    try {
      const systemPrompt = userContext ? `${SYSTEM}\nUser context: ${userContext}` : SYSTEM;
      const history = messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history
          ],
          temperature: 0.3,
          stream: true,
        }),
      });

      if (res.ok) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let full = '';

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
                  full += chunk;
                  onChunk(chunk);
                }
              } catch { /* skip */ }
            }
          }
        }
        return full;
      } else {
        console.error('Groq stream chat response status error:', res.status);
      }
    } catch (e) {
      console.error('Groq stream chat failed:', e);
    }
  }

  // Fallback to Gemini stream
  const model = getModel(userContext ? `User context: ${userContext}` : '');
  if (!model) {
    const text = fallbackResponse('chat', { lastMessage: messages.at(-1)?.content });
    for (const word of text.split(' ')) {
      onChunk(word + ' ');
      await new Promise((r) => setTimeout(r, 30));
    }
    return text;
  }

  const last = messages.at(-1);
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(last?.content || '');

  let full = '';
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      full += text;
      onChunk(text);
    }
  }
  return full;
}

export async function draftDocument(type, caseDetails) {
  const prompt = `Draft a formal Indian legal document of type "${type}" with proper headings and sections.
Case details: ${JSON.stringify(caseDetails)}
Use formal legal English suitable for Indian courts.`;
  return complete(prompt, 4096);
}

export async function explainSection(actName, sectionNumber) {
  const prompt = `Explain ${sectionNumber} of ${actName} in plain language for a layperson in India. Include a practical example. Keep under 300 words.`;
  return complete(prompt, 600);
}

export async function briefOnPrecedent(citation, facts) {
  const prompt = `Explain how precedent "${citation}" applies to these facts: ${facts}. Under 250 words.`;
  return complete(prompt, 500);
}

export async function getCalculationRecommendation(calcResult, inputData) {
  const prompt = `In exactly 3 sentences: (1) case strength verdict, (2) one recommendation, (3) one risk.
Calculation: ${JSON.stringify(calcResult)}. Inputs: ${JSON.stringify(inputData)}. Indian family law context.`;
  return complete(prompt, 300);
}
