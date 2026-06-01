import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import StreamingText from '../ui/StreamingText';

const QUICK = [
  'Explain interim maintenance under Section 24 HMA',
  'What is Section 25 HMA?',
  'How strong is my maintenance claim?',
];

export default function ChatInterface() {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Namaste. I'm Lex, your Indian family law assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const content = text || input.trim();
    if (!content || streaming) return;

    const newMsgs = [...messages, { role: 'user', content }];
    setMessages(newMsgs);
    setInput('');
    setStreaming(true);
    
    const placeholder = { role: 'assistant', content: '' };
    console.log('Assistant message object after creation:', placeholder);
    setMessages((m) => [...m, placeholder]);

    try {
      const base = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${base}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('alimony_token')}`,
        },
        body: JSON.stringify({ messages: newMsgs.filter((m) => m.role !== 'assistant' || m.content) }),
      });

      console.log('Full API Response:', res);

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `HTTP error! status: ${res.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        console.log('API response chunk:', chunk);
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.text !== undefined && data.text !== null) {
              console.log('Verified streaming content is not empty/null/undefined:', data.text);
              acc += data.text;
              console.log('Appended chunk to accumulated content:', acc);
              setMessages((m) => {
                const copy = [...m];
                const isImmutable = copy !== m && copy[copy.length - 1] !== m[m.length - 1];
                console.log('React state update is immutable:', isImmutable);
                copy[copy.length - 1] = { role: 'assistant', content: acc };
                console.log('Chat state update (messages state):', copy);
                return copy;
              });
            }
          } catch (e) {
            console.error('Failed to parse line:', trimmed, e);
          }
        }
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        const isImmutable = copy !== m && copy[copy.length - 1] !== m[m.length - 1];
        console.log('React error state update is immutable:', isImmutable);
        copy[copy.length - 1] = { role: 'assistant', content: `Error: ${e.message}. Please sign in and try again.` };
        console.log('Chat error state update (messages state):', copy);
        return copy;
      });
    } finally {
      setStreaming(false);
      console.log('Streaming loading state cleared');
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium" style={{ background: 'var(--gold)', color: 'var(--btn-on-accent)' }}>Lex</div>
            )}
            <div
              className="max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={{
                background: m.role === 'user' ? 'var(--gold)' : 'var(--bg-overlay)',
                color: m.role === 'user' ? 'var(--btn-on-accent)' : 'var(--text-primary)',
              }}
            >
              {m.role === 'assistant' ? (
                m.content ? (
                  <StreamingText text={m.content} speed={10} />
                ) : streaming && i === messages.length - 1 ? (
                  <div className="flex gap-1 py-1.5 items-center">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" style={{ animationDuration: '1s' }}></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: '0.2s', animationDuration: '1s' }}></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: '0.4s', animationDuration: '1s' }}></span>
                  </div>
                ) : (
                  ''
                )
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="border-t p-3" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="mb-2 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button key={q} type="button" onClick={() => send(q)} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              {q.slice(0, 40)}…
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            rows={2}
            placeholder="Ask Lex about Indian family law…"
            className="flex-1 resize-none rounded-lg border px-4 py-2 text-sm"
            style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            disabled={streaming}
            onClick={() => send()}
            className="btn-primary rounded-lg px-4 disabled:opacity-50"
          >
            {streaming ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
