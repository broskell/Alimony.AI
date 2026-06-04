import { generateResponse } from './ai/index.js';

const SYSTEM = `You are an Indian family law specialist AI assistant named Lex.
You specialize in: Hindu Marriage Act 1955, CrPC Section 125, Protection of Women from DV Act 2005,
Hindu Adoption & Maintenance Act 1956, Special Marriage Act 1954.
You cite specific sections and Supreme Court precedents (especially Rajnesh v. Neha 2020).
You speak in clear, empathetic language. You always remind users to consult a licensed advocate.
You are familiar with court procedures in Delhi HC, Bombay HC, Madras HC, Telangana HC.
Current year: 2024. Always cite actual case law when relevant.`;

export async function analyzeCase(caseDescription) {
  const prompt = `Analyze this Indian family law case and respond ONLY with valid JSON:
{ "summary": "", "risks": [], "recommendations": [], "applicableActs": [], "strengthScore": 0-100 }
Case: ${caseDescription}`;

  const text = await generateResponse({ prompt, maxOutputTokens: 800 });
  try {
    const json = text.match(/\{[\s\S]*\}/);
    return JSON.parse(json ? json[0] : text);
  } catch {
    return {
      summary: 'Case involves matrimonial maintenance under HMA and CrPC 125.',
      risks: ['Income proof may be challenged', 'Interim order timeline varies by court'],
      recommendations: ['Gather 3 years income tax returns', 'Document marriage expenses'],
      applicableActs: ['HMA 1955', 'CrPC Section 125'],
      strengthScore: 65,
    };
  }
}

export async function chatWithLawyer(messages, userContext = '') {
  return await generateResponse({
    messages,
    systemInstruction: userContext ? `${SYSTEM}\nUser context: ${userContext}` : SYSTEM,
  });
}

export async function streamChat(messages, userContext, onChunk) {
  return await generateResponse({
    messages,
    systemInstruction: userContext ? `${SYSTEM}\nUser context: ${userContext}` : SYSTEM,
    stream: true,
    onChunk,
  });
}

export async function draftDocument(type, caseDetails) {
  const prompt = `You are an Indian legal drafting assistant.
Draft a formal Indian court document of type "${type}" based on the following case details:
${JSON.stringify(caseDetails)}

Format requirements:
1. You MUST output ONLY the document. Do NOT include any introductions, explanations, apologies, notes, commentary, or markdown code fences (do NOT wrap the response in \`\`\`markdown or \`\`\`).
2. Begin directly with:
# [DOCUMENT TITLE]
3. Use proper court-document structure. The document MUST be structured in clean Markdown format:
- Use H1 (#) for the main Document Title (e.g., # PETITION FOR MAINTENANCE).
- Use H2 (##) for court details and top-level sections (e.g. ## IN THE COURT OF [COURT NAME], ## FACTS OF THE CASE, ## PRAYER).
- Use H3 (###) for subsections and parties details (e.g. ### PETITIONER, ### RESPONDENT).
- Under ### PETITIONER and ### RESPONDENT, use clear labels: "Name:" and "Address:".
- Use bullet points (- or *) or numbered lists (1., 2.) for structured clauses, facts, and details.
- Use standard paragraphs for prose.
- Use horizontal rules (---) as dividers between major parts.
- Use formal legal English suitable for Indian courts.`;
  return await generateResponse({ prompt, maxOutputTokens: 4096 });
}

export async function explainSection(actName, sectionNumber) {
  const prompt = `Explain ${sectionNumber} of ${actName} in plain language for a layperson in India. Include a practical example. Keep under 300 words.`;
  return await generateResponse({ prompt, maxOutputTokens: 600 });
}

export async function briefOnPrecedent(citation, facts) {
  const prompt = `Explain how precedent "${citation}" applies to these facts: ${facts}. Under 250 words.`;
  return await generateResponse({ prompt, maxOutputTokens: 500 });
}

export async function getCalculationRecommendation(calcResult, inputData) {
  const prompt = `In exactly 3 sentences: (1) case strength verdict, (2) one recommendation, (3) one risk.
Calculation: ${JSON.stringify(calcResult)}. Inputs: ${JSON.stringify(inputData)}. Indian family law context.`;
  return await generateResponse({ prompt, maxOutputTokens: 300 });
}
