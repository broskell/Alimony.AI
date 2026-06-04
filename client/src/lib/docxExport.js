import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ThematicBreak } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Compiles a sanitized markdown legal document string into a Microsoft Word (.docx) file
 * and triggers a browser download.
 *
 * @param {string} title - The title of the document (e.g. "Petition for Maintenance").
 * @param {string} markdownText - The clean markdown content of the legal document.
 */
export const exportToDocx = async (title, markdownText) => {
  const lines = markdownText.split('\n');
  const children = [];

  // Helper to parse inline markdown bold and italic markers and return TextRun objects
  const parseInlineStyles = (text, options = {}) => {
    const runs = [];
    // Matches bold+italic (*** or ___), bold only (** or __), italic only (* or _)
    const tokenRegex = /(\*\*\*|___)(.*?)\1|(\*\*|__)(.*?)\3|(\*|_)(.*?)\5/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      const matchIndex = match.index;

      // Plain text prefix
      if (matchIndex > lastIndex) {
        runs.push(new TextRun({
          text: text.substring(lastIndex, matchIndex),
          font: 'Georgia',
          size: options.size || 24, // 24 half-points = 12pt
          italics: options.italics || false,
        }));
      }

      if (match[1]) {
        // Bold + Italic
        runs.push(new TextRun({
          text: match[2],
          bold: true,
          italics: true,
          font: 'Georgia',
          size: options.size || 24,
        }));
      } else if (match[3]) {
        // Bold
        runs.push(new TextRun({
          text: match[4],
          bold: true,
          font: 'Georgia',
          size: options.size || 24,
          italics: options.italics || false,
        }));
      } else if (match[5]) {
        // Italic
        runs.push(new TextRun({
          text: match[6],
          font: 'Georgia',
          size: options.size || 24,
          italics: true,
        }));
      }

      lastIndex = tokenRegex.lastIndex;
    }

    // Trailing plain text
    if (lastIndex < text.length) {
      runs.push(new TextRun({
        text: text.substring(lastIndex),
        font: 'Georgia',
        size: options.size || 24,
        italics: options.italics || false,
      }));
    }

    // Return simple plain text run if no regex matches occurred
    if (runs.length === 0 && text.length > 0) {
      runs.push(new TextRun({
        text: text,
        font: 'Georgia',
        size: options.size || 24,
        italics: options.italics || false,
      }));
    }

    return runs;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      // Empty lines represent paragraph separators
      children.push(new Paragraph({
        spacing: { after: 120 },
      }));
      continue;
    }

    // Headings (H1 to H6)
    if (line.startsWith('#')) {
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        let text = headingMatch[2].trim();
        
        // H2 uppercase requirement
        if (level === 2) {
          text = text.toUpperCase();
        }

        let headingLevel = HeadingLevel.HEADING_1;
        let fontSize = 32; // default H1: 16pt (32 half-points)
        let isCentered = false;

        if (level === 1) {
          headingLevel = HeadingLevel.HEADING_1;
          fontSize = 32;
          isCentered = true;
        } else if (level === 2) {
          headingLevel = HeadingLevel.HEADING_2;
          fontSize = 28; // 14pt
        } else if (level === 3) {
          headingLevel = HeadingLevel.HEADING_3;
          fontSize = 24; // 12pt
        } else if (level === 4) {
          headingLevel = HeadingLevel.HEADING_4;
          fontSize = 22; // 11pt
        } else if (level === 5) {
          headingLevel = HeadingLevel.HEADING_5;
          fontSize = 20; // 10pt
        } else {
          headingLevel = HeadingLevel.HEADING_6;
          fontSize = 18; // 9pt
        }

        children.push(new Paragraph({
          children: parseInlineStyles(text, { size: fontSize }),
          heading: headingLevel,
          alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { before: 240, after: 120 },
        }));
        continue;
      }
    }

    // Horizontal Rules
    if (line === '---' || line === '***' || line === '___') {
      children.push(new Paragraph({
        children: [new ThematicBreak()],
        spacing: { before: 240, after: 240 },
      }));
      continue;
    }

    // Blockquotes
    if (line.startsWith('>')) {
      const quoteMatch = line.match(/^>\s*(.*)$/);
      if (quoteMatch) {
        const text = quoteMatch[1].trim();
        children.push(new Paragraph({
          children: parseInlineStyles(text, { italics: true }),
          indent: { left: 720 }, // 0.5 inch indent
          spacing: { before: 120, after: 120, line: 360 },
        }));
        continue;
      }
    }

    // Bullet Lists (* or - or +)
    const bulletMatch = line.match(/^([\*\-\+])\s+(.*)$/);
    if (bulletMatch && !line.startsWith('---') && !line.startsWith('***')) {
      const text = bulletMatch[2].trim();
      children.push(new Paragraph({
        children: parseInlineStyles(text),
        bullet: { level: 0 },
        spacing: { after: 120, line: 360 },
      }));
      continue;
    }

    // Numbered Lists (1. or 2.)
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const numPrefix = `${numMatch[1]}. `;
      const text = numMatch[2].trim();
      children.push(new Paragraph({
        children: [
          new TextRun({ text: numPrefix, bold: true, font: 'Georgia', size: 24 }),
          ...parseInlineStyles(text)
        ],
        spacing: { after: 120, line: 360 },
      }));
      continue;
    }

    // Regular Body Paragraph
    children.push(new Paragraph({
      children: parseInlineStyles(line),
      spacing: { after: 180, line: 360 },
    }));
  }

  // Define doc settings and metadata
  const doc = new Document({
    creator: 'Alimony.AI',
    company: 'Alimony.AI',
    title: title,
    description: `Court draft generated by Alimony.AI for ${title}`,
    styles: {
      default: {
        document: {
          run: {
            font: 'Georgia',
            size: 24, // 12pt
            color: '111827', // matching #111827 text style
          },
          paragraph: {
            spacing: { line: 360, after: 180 }, // line height 1.5, space after
          },
        },
        heading1: {
          run: {
            font: 'Georgia',
            size: 32, // 16pt
            bold: true,
            color: '111827',
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
          },
        },
        heading2: {
          run: {
            font: 'Georgia',
            size: 28, // 14pt
            bold: true,
            color: '111827',
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
        heading3: {
          run: {
            font: 'Georgia',
            size: 24, // 12pt
            bold: true,
            color: '111827',
          },
          paragraph: {
            spacing: { before: 180, after: 120 },
          },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch margins
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_draft.docx`;
  saveAs(blob, fileName);
};
