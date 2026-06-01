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
            { title: 'Rajnesh guidelines. 12 factors. Your state.', desc: 'Based on Rajnesh v. Neha (2020) SC Guidelines. 12 factors. Your state\'s High Court tendencies. In 90 seconds.', reverse: false },
            { title: 'Meet Lex — your AI advocate', desc: "Ask anything. 'What is Section 25 HMA?' 'What's interim maintenance?' 'How strong is my case?'", reverse: true },
            { title: 'Find the right advocate', desc: 'Bar council verified. Rated by clients. Filtered by state, language, and budget.', reverse: false },
            { title: 'Track every hearing', desc: 'From filing to final order — timeline, documents, and AI case briefs in one place.', reverse: true },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col items-center gap-12 md:flex-row ${f.reverse ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="h-48 w-full rounded-xl md:w-1/2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />
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
