/**
 * Sanitizes AI-generated legal document markdown to remove conversational prefixes/suffixes,
 * markdown code fences, and other accidental wrappers.
 *
 * @param {string} markdown - The raw markdown response from the AI.
 * @returns {string} The cleaned, structured legal document markdown.
 */
export function sanitizeLegalDocument(markdown) {
  if (!markdown) return '';

  // 1. Remove code fences like ```markdown or ``` at start/end
  let text = markdown.replace(/^```[a-zA-Z]*\n?/gm, '').replace(/```\n?$/gm, '');

  // 2. Remove leading conversational text.
  // Legal documents should start with standard Markdown elements (like # TITLE).
  // If there's conversational prefix text, check if we can locate the first heading.
  const headingMatch = text.match(/^(#+\s+.*)/m);
  if (headingMatch && headingMatch.index > 0) {
    const prefix = text.substring(0, headingMatch.index).trim();
    // Conversational pattern checker: words like "Here is", "Sure", "Okay", etc.
    // If the prefix is short or contains standard conversational filler, strip it.
    const conversationalRegex = /^(here is|here's|certainly|sure|okay|as requested|below is|i have drafted|please find|this is a draft|draft of the|matrimonial maintenance petition|drafting a petition).*/gi;
    
    // Split into lines to inspect the first few lines
    const lines = prefix.split('\n');
    let shouldStrip = false;
    
    // If prefix is small, or matches common intro phrases, or consists only of blank lines/small text
    if (prefix.length < 300 || lines.some(l => conversationalRegex.test(l.trim()))) {
      shouldStrip = true;
    }
    
    if (shouldStrip) {
      text = text.substring(headingMatch.index).trim();
    }
  }

  // 3. Remove trailing conversational text
  // e.g. "Let me know if you need anything else."
  const trailingRegex = /^(hope this helps|let me know|if you need|disclaimer: this is for informational|this draft is).*$/gi;
  const lines = text.split('\n');
  let endIndex = lines.length - 1;
  while (endIndex >= 0) {
    const line = lines[endIndex].trim();
    if (line === '' || trailingRegex.test(line) || (line.length < 80 && /^(regards|thanks|sincerely)/i.test(line))) {
      endIndex--;
    } else {
      break;
    }
  }
  text = lines.slice(0, endIndex + 1).join('\n').trim();

  // 4. Ensure there are no accidental nested double-asterisks around titles (e.g. ## **Heading**)
  // react-markdown handles standard headers, but cleaning up headers with nested strong
  // like "# **PETITION**" into "# PETITION" is cleaner for legal formats.
  text = text.replace(/^(#+)\s+\*\*([^*]+)\*\*/gm, '$1 $2');

  return text;
}
