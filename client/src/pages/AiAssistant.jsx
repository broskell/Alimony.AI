import ChatInterface from '../components/ai/ChatInterface';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';

export default function AiAssistant() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-3xl">Lex AI</h1>
      <p className="mt-2 font-light" style={{ color: 'var(--text-secondary)' }}>
        Indian family law specialist · HMA · CrPC 125 · Rajnesh guidelines
      </p>
      {!user && (
        <p className="mt-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
          <Link to="/login">Sign in</Link> for full chat history and case linking.
        </p>
      )}
      <div className="mt-8">
        <ChatInterface />
      </div>
    </div>
  );
}
