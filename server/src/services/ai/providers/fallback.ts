import type { GenerateOptions } from './gemini.js';

export async function generateResponse(options: GenerateOptions): Promise<string> {
  const promptText = options.prompt || '';
  const lastMsgText = options.messages && options.messages.length > 0
    ? options.messages[options.messages.length - 1].content
    : '';

  const searchText = (promptText + ' ' + lastMsgText).toLowerCase();

  let type = 'chat';
  if (searchText.includes('analyze') || searchText.includes('valid json')) {
    type = 'analyze';
  } else if (searchText.includes('draft') || searchText.includes('petition')) {
    type = 'draft';
  } else if (searchText.includes('explain')) {
    type = 'explain';
  } else if (searchText.includes('brief') || searchText.includes('precedent')) {
    type = 'brief';
  } else if (searchText.includes('verdict') || searchText.includes('recommendation') || searchText.includes('calculation')) {
    type = 'recommendation';
  }

  const fallbacks: Record<string, string> = {
    chat: `Based on Indian family law principles, your inquiry relates to maintenance under the Hindu Marriage Act and CrPC Section 125. Courts consider income disparity, marriage duration, and standard of living per Rajnesh v. Neha (2020). Please consult a licensed advocate for case-specific advice.`,
    analyze: JSON.stringify({
      summary: 'Case involves matrimonial maintenance under HMA and CrPC 125.',
      risks: ['Income proof may be challenged', 'Interim order timeline varies by court'],
      recommendations: ['Gather 3 years income tax returns', 'Document marriage expenses'],
      applicableActs: ['HMA 1955', 'CrPC Section 125'],
      strengthScore: 65,
    }),
    draft: `IN THE COURT OF THE DISTRICT JUDGE AT [CITY]\n\nPETITION FOR MAINTENANCE UNDER SECTION 25, HINDU MARRIAGE ACT 1955\n\n[Draft generated offline — configure GEMINI_API_KEY for full AI drafting]`,
    explain: `This section empowers courts to grant maintenance considering the financial capacity of both parties and the needs of the applicant, guided by Supreme Court precedents including Rajnesh v. Neha (2020).`,
    brief: `This precedent establishes guidelines for determining maintenance quantum based on income disparity and standard of living.`,
    recommendation: `Your maintenance claim appears moderately strong given typical High Court factors. Document all income sources and consider interim relief under Section 24 HMA. Risk: opposing party may understate income — seek discovery. Consult a matrimonial law advocate in your jurisdiction.`,
  };

  const responseText = fallbacks[type] || fallbacks.chat;

  if (options.stream && options.onChunk) {
    const words = responseText.split(' ');
    for (const word of words) {
      options.onChunk(word + ' ');
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  }

  return responseText;
}
