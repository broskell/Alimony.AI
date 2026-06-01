import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import HearingTimeline from '../components/case/HearingTimeline';
import StreamingText from '../components/ui/StreamingText';
import Skeleton from '../components/ui/Skeleton';
import LawBadge from '../components/ui/LawBadge';

export default function CaseDetail() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    api.get(`/cases/${id}`).then((r) => {
      setCaseData(r.data);
      setAiSummary(r.data.aiSummary || '');
    });
  }, [id]);

  const fetchAi = async () => {
    const { data } = await api.get(`/cases/${id}/ai-summary`);
    setAiSummary(data.summary || JSON.stringify(data));
  };

  if (!caseData) return <Skeleton height="400px" />;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-6">
        <div>
          <p className="mono text-xs" style={{ color: 'var(--text-muted)' }}>{caseData.caseNumber}</p>
          <h1 className="text-2xl">{caseData.title}</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{caseData.court} · {caseData.state}</p>
          <div className="mt-3 flex gap-2">{caseData.acts?.map((a) => <LawBadge key={a} act={a} />)}</div>
        </div>
        <p className="font-light leading-relaxed">{caseData.description}</p>
        <div className="rounded-xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg">AI Case Brief</h2>
            <button type="button" onClick={fetchAi} className="text-sm" style={{ color: 'var(--gold)' }}>Refresh</button>
          </div>
          <StreamingText text={aiSummary || 'Click refresh to generate AI brief…'} className="mt-4 text-sm font-light italic" />
        </div>
      </div>
      <div className="lg:col-span-2">
        <h2 className="mb-6 text-lg">Hearing Timeline</h2>
        <HearingTimeline hearings={caseData.hearings} />
      </div>
    </div>
  );
}
