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
    return <span className={className} style={style} />;
  }

  return (
    <span className={`${className} ${!done ? 'cursor-blink' : ''}`} style={style}>
      {done ? text : displayed}
    </span>
  );
}
