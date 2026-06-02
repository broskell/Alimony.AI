import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import StreamingText from '../ui/StreamingText';
import Icon from '../ui/Icon';

const QUICK = [
  'Explain interim maintenance under Section 24 HMA',
  'What is Section 25 HMA?',
  'How strong is my maintenance claim?',
];

export default function ChatInterface() {
  const { token } = useAuthStore();
  const { showToast } = useAppStore();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Namaste. I'm Lex, your Indian family law assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState('');
  const [activeError, setActiveError] = useState(false);
  const [providerStatus, setProviderStatus] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const content = text || input.trim();
    if (!content || streaming) return;

    // Reset error state and status
    setActiveError(false);
    setProviderStatus('');
    setLastUserPrompt(content);

    // Keep history clean of errors for resubmission
    const chatHistory = messages.filter((m) => !m.content.startsWith('Error:'));
    
    // Add user message
    const newMsgs = [...chatHistory, { role: 'user', content }];
    setMessages(newMsgs);
    setInput('');
    setStreaming(true);

    // Add placeholder assistant message
    const placeholder = { role: 'assistant', content: '' };
    setMessages((m) => [...m, placeholder]);

    try {
      const base = import.meta.env.VITE_API_URL;
      const res = await fetch(`${base}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('alimony_token')}`,
        },
        body: JSON.stringify({ messages: newMsgs.filter((m) => m.role !== 'assistant' || m.content) }),
      });

      if (res.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      }

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

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read the response stream');
      }
      const decoder = new TextDecoder();
      let acc = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            
            // Check if there is provider switching status
            if (data.status) {
              setProviderStatus(data.status);
            }

            if (data.text !== undefined && data.text !== null) {
              // Hide inner markdown provider status to keep display beautiful
              let chunkText = data.text;
              if (chunkText.includes('AI service temporarily busy. Switching providers...')) {
                setProviderStatus('AI service temporarily busy. Switching providers...');
              }
              acc += chunkText;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: 'assistant', content: acc };
                return copy;
              });
            }
          } catch (e) {
            console.error('Failed to parse line:', trimmed, e);
          }
        }
      }
    } catch (e) {
      setActiveError(true);
      const friendlyError = e.message && e.message.includes('Failed to fetch')
        ? 'Network Connection lost. Please ensure the backend is running and try again.'
        : `Error: ${e.message || 'Unknown error'}`;
      
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { 
          role: 'assistant', 
          content: friendlyError 
        };
        return copy;
      });
      showToast(friendlyError, 'error');
    } finally {
      setStreaming(false);
    }
  };

  const handleRetry = () => {
    if (lastUserPrompt) {
      send(lastUserPrompt);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-xl border relative" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
      {/* Dynamic Provider Switching Alert */}
      {providerStatus && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold shadow-md animate-pulse border bg-amber-950/70 border-amber-500/30 text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          {providerStatus}
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => {
          const isError = m.role === 'assistant' && (m.content.startsWith('Error:') || m.content.startsWith('Network Connection'));
          return (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ background: 'var(--gold)', color: 'var(--btn-on-accent)' }}>Lex</div>
              )}
              <div
                className="max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed relative group"
                style={{
                  background: m.role === 'user' ? 'var(--gold)' : isError ? 'rgba(217, 79, 61, 0.1)' : 'var(--bg-overlay)',
                  border: isError ? '1px solid rgba(217, 79, 61, 0.2)' : 'none',
                  color: m.role === 'user' ? 'var(--btn-on-accent)' : isError ? '#f87171' : 'var(--text-primary)',
                }}
              >
                {m.role === 'assistant' ? (
                  m.content ? (
                    <div>
                      <StreamingText text={m.content} speed={8} />
                      {isError && (
                        <button
                          type="button"
                          onClick={handleRetry}
                          className="mt-3 flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        >
                          <Icon name="refresh" size={14} />
                          Retry Prompt
                        </button>
                      )}
                    </div>
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
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Message Input & Quick Replies */}
      <div className="border-t p-3" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="mb-2 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              disabled={streaming}
              onClick={() => send(q)}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-neutral-900"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              {q}
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
            className="flex-1 resize-none rounded-lg border px-4 py-2.5 text-sm"
            style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            disabled={streaming || !input.trim()}
            onClick={() => send()}
            className="btn-primary rounded-lg px-5 disabled:opacity-50"
          >
            {streaming ? (
              <span className="flex h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
