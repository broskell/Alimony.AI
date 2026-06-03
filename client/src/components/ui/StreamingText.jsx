import { useEffect, useState } from 'react';

export default function StreamingText({ text = '', speed = 15, className = '', style = {} }) {
  const [prevText, setPrevText] = useState(text);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  if (text !== prevText) {
    setPrevText(text);
    if (prevText && text.startsWith(prevText)) {
      setDone(false);
    } else {
      setDisplayed('');
      setDone(false);
    }
  }

  useEffect(() => {
    if (!text) {
      return;
    }

    const interval = setInterval(() => {
      setDisplayed((curr) => {
        const nextLen = curr.length + 1;
        if (nextLen >= text.length) {
          clearInterval(interval);
          setDone(true);
          return text;
        }
        return text.slice(0, nextLen);
      });
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  if (!text) {
    return <div className={className} style={style} />;
  }

  const currentText = done ? text : displayed;

  // Simple and robust markdown parser for inline elements
  const renderInline = (inlineText, isLastLine = false) => {
    if (!inlineText) {
      return isLastLine && !done ? [
        <span
          key="cursor"
          className="inline-block h-3.5 w-1.5 ml-1 animate-pulse"
          style={{ background: 'var(--gold)', verticalAlign: 'middle' }}
        />
      ] : [];
    }

    const parts = inlineText.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    const nodes = parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-[var(--text-primary)]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={idx} className="italic text-[var(--text-primary)]">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });

    if (isLastLine && !done) {
      nodes.push(
        <span
          key="cursor"
          className="inline-block h-3.5 w-1.5 ml-1 animate-pulse"
          style={{ background: 'var(--gold)', verticalAlign: 'middle' }}
        />
      );
    }

    return nodes;
  };

  const parseMarkdown = (txt) => {
    const lines = txt.split('\n');
    const renderedLines = [];
    let listItems = [];
    let listType = null; // 'ul' or 'ol'
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        const key = `list-${renderedLines.length}`;
        if (listType === 'ol') {
          renderedLines.push(
            <ol key={key} className="pl-5 my-2 space-y-1 list-decimal" style={{ listStyleType: 'decimal' }}>
              {listItems}
            </ol>
          );
        } else {
          renderedLines.push(
            <ul key={key} className="pl-5 my-2 space-y-1 list-disc" style={{ listStyleType: 'disc' }}>
              {listItems}
            </ul>
          );
        }
        listItems = [];
        inList = false;
        listType = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const isLastLine = i === lines.length - 1;

      // Headings
      if (trimmed.startsWith('### ')) {
        flushList();
        renderedLines.push(
          <h3 key={i} className="text-sm font-bold mt-4 mb-2 text-[var(--text-primary)]" style={{ lineHeight: '1.4' }}>
            {renderInline(trimmed.slice(4), isLastLine)}
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList();
        renderedLines.push(
          <h2 key={i} className="text-base font-bold mt-5 mb-2.5 text-[var(--text-primary)]" style={{ lineHeight: '1.4' }}>
            {renderInline(trimmed.slice(3), isLastLine)}
          </h2>
        );
      } else if (trimmed.startsWith('# ')) {
        flushList();
        renderedLines.push(
          <h1 key={i} className="text-lg font-bold mt-6 mb-3 text-[var(--text-primary)]" style={{ lineHeight: '1.4' }}>
            {renderInline(trimmed.slice(2), isLastLine)}
          </h1>
        );
      }
      // Bullet Lists
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (inList && listType !== 'ul') {
          flushList();
        }
        inList = true;
        listType = 'ul';
        listItems.push(
          <li key={`li-${i}`} className="text-sm">
            {renderInline(trimmed.slice(2), isLastLine)}
          </li>
        );
      }
      // Numbered Lists
      else if (/^\d+\.\s+/.test(trimmed)) {
        if (inList && listType !== 'ol') {
          flushList();
        }
        inList = true;
        listType = 'ol';
        const match = trimmed.match(/^(\d+)\.\s+(.*)/);
        listItems.push(
          <li key={`li-${i}`} className="text-sm">
            {renderInline(match ? match[2] : trimmed, isLastLine)}
          </li>
        );
      }
      // Empty Line
      else if (trimmed === '') {
        flushList();
        if (!isLastLine) {
          renderedLines.push(<div key={`spacer-${i}`} className="h-2" />);
        }
      }
      // Regular Paragraph
      else {
        flushList();
        renderedLines.push(
          <p key={i} className="text-sm mb-2 leading-relaxed">
            {renderInline(line, isLastLine)}
          </p>
        );
      }
    }
    flushList();
    return renderedLines;
  };

  return (
    <div className={className} style={style}>
      {parseMarkdown(currentText)}
    </div>
  );
}
