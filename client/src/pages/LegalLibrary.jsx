import { useEffect, useState } from 'react';
import api from '../lib/api';
import StreamingText from '../components/ui/StreamingText';
import Skeleton from '../components/ui/Skeleton';

export default function LegalLibrary() {
  const [acts, setActs] = useState([]);
  const [selectedAct, setSelectedAct] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [precedents, setPrecedents] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/library/acts').then((r) => { setActs(r.data); if (r.data[0]) setSelectedAct(r.data[0]); }),
      api.get('/library/precedents').then((r) => setPrecedents(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAct) return;
    api.get(`/library/acts/${selectedAct.id}/sections`).then((r) => {
      setSections(r.data);
      setSelectedSection(r.data[0]);
    });
  }, [selectedAct]);

  const doSearch = async () => {
    if (!search.trim()) return;
    const { data } = await api.get(`/library/sections/search?q=${encodeURIComponent(search)}`);
    setSearchResults(data);
  };

  const explain = async () => {
    if (!selectedSection || !selectedAct) return;
    const { data } = await api.post('/ai/explain-section', {
      actName: selectedAct.name,
      sectionNumber: selectedSection.number,
    });
    setExplanation(data.explanation);
  };

  if (loading) return <Skeleton height="500px" />;

  return (
    <div>
      <h1 className="text-3xl">Legal Library</h1>
      <div className="mt-6 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          placeholder="Search sections & precedents…"
          className="flex-1 rounded-lg border px-4 py-3"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        />
        <button type="button" onClick={doSearch} className="btn-primary rounded-lg px-5">Search</button>
      </div>
      {searchResults && (
        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-sm mb-2">{searchResults.sections?.length} sections · {searchResults.precedents?.length} precedents</p>
        </div>
      )}
      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-72 shrink-0 space-y-2">
          {acts.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => setSelectedAct(act)}
              className="w-full rounded-lg border px-4 py-3 text-left text-sm"
              style={{
                borderColor: selectedAct?.id === act.id ? 'var(--gold)' : 'var(--border-dim)',
                background: selectedAct?.id === act.id ? 'var(--bg-overlay)' : 'var(--bg-card)',
              }}
            >
              {act.shortName} {act.year}
            </button>
          ))}
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setSelectedSection(s); setExplanation(''); }}
              className="w-full rounded px-4 py-2 text-left text-xs"
              style={{ color: selectedSection?.id === s.id ? 'var(--gold)' : 'var(--text-muted)' }}
            >
              {s.number}
            </button>
          ))}
        </aside>
        <main className="flex-1 rounded-xl border p-6 md:p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          {selectedSection ? (
            <>
              <h2 className="text-2xl">{selectedSection.number}</h2>
              <p className="mt-1 text-lg" style={{ color: 'var(--text-secondary)' }}>{selectedSection.title}</p>
              <p className="mt-6 font-light leading-loose">{selectedSection.text}</p>
              <button type="button" onClick={explain} className="btn-primary mt-6 rounded-lg px-4 py-2 text-sm">
                Explain in plain language →
              </button>
              {explanation && <StreamingText text={explanation} className="mt-6 text-sm font-light italic" />}
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Select an act and section</p>
          )}
        </main>
      </div>
      <section className="mt-16">
        <h2 className="text-2xl mb-6">Case Precedents</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {precedents.map((p) => (
            <div key={p.id} className="rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <p className="mono text-sm" style={{ color: 'var(--gold)' }}>{p.citation}</p>
              <p className="mt-2 italic">{p.parties}</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{p.summary}</p>
              <p className="mt-3 text-sm font-medium">Holding: {p.holding}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
