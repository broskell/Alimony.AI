import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Icon from '../components/ui/Icon';

const PAIN = [
  { title: 'No cost estimate', body: 'You walk into court blind on what maintenance you deserve', tag: 'Financial' },
  { title: 'Wrong lawyer', body: 'Finding a specialist in matrimonial law takes weeks of calls', tag: 'Access' },
  { title: 'Missing precedents', body: 'Rajnesh v. Neha (2020) could win your case — do you know it?', tag: 'Research' },
  { title: 'Document chaos', body: 'Petitions drafted wrong get dismissed on Day 1', tag: 'Procedure' },
  { title: 'Zero transparency', body: "Lawyers won't tell you your actual odds", tag: 'Trust' },
];

const STATS = ['50+ HC JUDGMENTS', '12 LEGAL FACTORS', '6 ACTS COVERED', 'PDF REPORT'];

export default function Landing() {
  return (
    <div className="hero-bg min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="relative z-10">
        <Navbar />
        <section className="mx-auto max-w-6xl px-4 pb-24 pt-16 md:px-8 md:pt-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="label-chip inline-flex items-center gap-2 rounded-full border px-3 py-1"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--gold)', fontSize: '9px' }}
          >
            <Icon name="balance" size={14} />
            INDIAN FAMILY LAW · POWERED BY AI
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 max-w-4xl text-[clamp(48px,7vw,88px)] leading-[0.95]"
          >
            Know what you&apos;re
            <br />
            entitled to.
            <br />
            <em style={{ color: 'var(--gold)' }}>Before court.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-lg text-base font-light"
            style={{ color: 'var(--text-secondary)' }}
          >
            India&apos;s most comprehensive alimony and maintenance calculator.
            Built on HMA, CrPC Section 125, and Supreme Court precedents.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap gap-4">
            <Link to="/calculator" className="btn-primary rounded-lg px-6 py-3 font-medium">
              Calculate Settlement →
            </Link>
            <Link to="/ai" className="btn-ghost rounded-lg px-6 py-3">
              Talk to Lex AI
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 flex flex-wrap gap-6 md:gap-10">
            {STATS.map((s) => (
              <span key={s} className="mono label-chip text-[10px]" style={{ color: 'var(--text-muted)' }}>{s}</span>
            ))}
          </motion.div>
        </section>

        <section className="border-t py-16" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-surface)' }}>
          <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 pb-4 md:grid md:grid-cols-5 md:overflow-visible md:px-8">
            {PAIN.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="min-w-[240px] rounded-lg border-l-2 p-5 md:min-w-0"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderLeftWidth: 2, borderLeftColor: 'var(--gold)' }}
              >
                <span className="label-chip text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.tag}</span>
                <h3 className="mt-2 text-lg">{p.title}</h3>
                <p className="mt-2 text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{p.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-24 px-4 py-24 md:px-8">
          {[
            { id: 'calc', title: 'Rajnesh guidelines. 12 factors. Your state.', desc: "Based on Rajnesh v. Neha (2020) SC Guidelines. 12 factors. Your state's High Court tendencies. In 90 seconds.", reverse: false },
            { id: 'lex', title: 'Meet Lex — your AI advocate', desc: "Ask anything. 'What is Section 25 HMA?' 'What's interim maintenance?' 'How strong is my case?'", reverse: true },
            { id: 'lawyer', title: 'Find the right advocate', desc: 'Bar council verified. Rated by clients. Filtered by state, language, and budget.', reverse: false },
            { id: 'track', title: 'Track every hearing', desc: 'From filing to final order — timeline, documents, and AI case briefs in one place.', reverse: true },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col items-center gap-12 md:flex-row ${f.reverse ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Graphic Block */}
              <div className="h-60 w-full rounded-xl md:w-1/2 overflow-hidden relative flex flex-col justify-center p-6 border shadow-lg" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                {f.id === 'calc' && (
                  <div className="flex items-center gap-6">
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-dashed border-[var(--gold)]">
                      <div className="text-center">
                        <span className="text-2xl font-bold mono" style={{ color: 'var(--gold)' }}>82%</span>
                        <p className="text-[8px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-secondary)' }}>Strength</p>
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                        <Icon name="check_circle" size={14} className="text-emerald-400" />
                        <span>Income Disparity (₹1.5L vs ₹20k)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                        <Icon name="check_circle" size={14} className="text-emerald-400" />
                        <span>8 Years Marriage Duration</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                        <Icon name="check_circle" size={14} className="text-emerald-400" />
                        <span>2 Dependent Children</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--gold)] font-medium">
                        <Icon name="bolt" size={14} />
                        <span>Delhi HC Multiplier: 1.0x</span>
                      </div>
                    </div>
                  </div>
                )}

                {f.id === 'lex' && (
                  <div className="w-full space-y-3">
                    <div className="flex justify-end">
                      <div className="rounded-lg rounded-tr-none px-3 py-1.5 text-xs text-[var(--btn-on-accent)] font-medium" style={{ background: 'var(--gold)' }}>
                        What is Section 24 HMA?
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: 'var(--gold)', color: 'var(--btn-on-accent)' }}>L</div>
                      <div className="rounded-lg rounded-tl-none p-3 text-[11px] leading-relaxed border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                        Under Section 24 HMA, the court may grant interim maintenance to a spouse who is unable to support themselves during litigation...
                        <span className="inline-block h-3 w-1.5 animate-pulse ml-0.5" style={{ background: 'var(--gold)' }} />
                      </div>
                    </div>
                  </div>
                )}

                {f.id === 'lawyer' && (
                  <div className="flex flex-col gap-3">
                    <div className="rounded-lg border p-3 flex items-center justify-between shadow-sm" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: 'linear-gradient(135deg, var(--gold), #5a4010)', color: 'var(--text-primary)' }}>AS</div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Adv. Amit Sharma</span>
                            <Icon name="verified" size={12} className="text-sky-400" />
                          </div>
                          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Delhi HC · Matrimonial Spec. · 12Y Exp</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-[10px]" style={{ color: 'var(--gold)' }}>
                          <Icon name="star" size={10} filled />
                          <span className="ml-0.5">4.9 (82)</span>
                        </div>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Verified</span>
                      </div>
                    </div>
                    <div className="rounded-lg border p-3 flex items-center justify-between opacity-60" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: 'linear-gradient(135deg, var(--text-secondary), #333)', color: 'var(--text-primary)' }}>PM</div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Adv. Priyal Mehta</span>
                            <Icon name="verified" size={12} className="text-sky-400" />
                          </div>
                          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Bombay HC · Family Court · 9Y Exp</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-[10px]" style={{ color: 'var(--gold)' }}>
                          <Icon name="star" size={10} filled />
                          <span className="ml-0.5">4.8 (64)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {f.id === 'track' && (
                  <div className="flex flex-col gap-2 relative pl-4">
                    <div className="absolute left-[20px] top-2 bottom-2 w-[1px]" style={{ background: 'var(--border-strong)' }} />
                    {[
                      { title: 'Matrimonial Petition Filed', desc: 'Delhi Family Court', status: 'completed' },
                      { title: 'Rajnesh v Neha Affidavit', desc: 'Verified financials submitted', status: 'completed' },
                      { title: 'Interim Argument', desc: 'Next hearing Scheduled', status: 'active' },
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start relative z-10">
                        <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          step.status === 'completed' 
                            ? 'bg-emerald-500 border-emerald-500 text-[8px] text-white' 
                            : 'bg-amber-500 border-amber-500 animate-pulse'
                        }`}>
                          {step.status === 'completed' && '✓'}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold leading-none" style={{ color: step.status === 'completed' ? 'var(--text-primary)' : 'var(--gold)' }}>{step.title}</p>
                          <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{step.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl">{f.title}</h2>
                <p className="mt-4 font-light" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}

        </section>

        <section className="relative overflow-hidden py-24 text-center" style={{ background: 'var(--bg-overlay)' }}>
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 50%, var(--accent-glow), transparent)' }} />
          <h2 className="relative text-5xl font-semibold md:text-6xl">
            Stop guessing.
            <br />
            Start knowing.
          </h2>
          <Link to="/calculator" className="btn-primary relative mt-8 inline-block rounded-lg px-8 py-4">
            Calculate Free →
          </Link>
        </section>

        <footer className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Built by Saathvik Kellampalli · Alimony.AI · Not legal advice
        </footer>
      </div>
    </div>
  );
}
