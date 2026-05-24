import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { callClaude } from '../lib/claude.js';

const SYSTEM_PROMPT = `You are a research advisor for prospective PhD students in the German life sciences — specifically cancer research, immunology, and neuroscience.

Your guidance is grounded in:
- The German doctoral system (structured Graduate Schools vs. Individualpromotion, TV-L E13 funding, thesis committees, Disputation)
- The major German research centres in these fields (DKFZ, DZNE, MPI for Brain Research, MPI-IE Freiburg, BIGS Bonn, IGSN Bochum, HBIGS Heidelberg, BSIO Charité, EMBL Heidelberg, Frankfurt Cancer Institute, NeuroCure)
- Practical research tooling: PubMed, bioRxiv, Connected Papers, Zotero, GO, UniProt, TCGA
- Realistic timelines and expectations for a 3-year structured PhD

Your style:
- Concrete and specific — name real institutions, papers, methods when relevant
- Honest about uncertainty — say when something depends on the supervisor or programme
- Always give actionable next steps
- Keep answers focused: 250-450 words unless the user explicitly asks for more
- If the user writes in German, answer in German. If in Arabic, answer in Arabic. Otherwise English.
- Use light Markdown (bullet lists, **bold** for key terms) but no headings unless the answer is long
- Never invent paper titles, DOIs, or author names. If you reference a paper, name only well-known landmark works you are confident about, or say "search PubMed for X"

You are speaking to a master's graduate in Humanbiologie (University of Greifswald) who is applying to PhD positions across cancer, immunology and neuroscience in Germany.`;

const STORAGE_KEY = 'phd-match-compass-thread';

export default function ResearchAssistant() {
  const { t, lang } = useI18n();
  const [thread, setThread] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
    catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thread));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [thread]);



  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const userMsg = { role: 'user', content: question };
    const nextThread = [...thread, userMsg];
    setThread(nextThread);
    setInput('');
    setError(null);



    setLoading(true);
    try {
      const { text: reply } = await callClaude({
        system: SYSTEM_PROMPT,
        messages: nextThread.map((m) => ({ role: m.role, content: m.content })),
        maxTokens: 1024,
        temperature: 0.5,
      });
      setThread((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message);
      setThread((prev) => prev.slice(0, -1)); // remove last user msg on failure
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send();
  };

  const examples = t('compass.assistant.examples');
  const exampleArr = Array.isArray(examples) ? examples : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Conversation */}
      <div className="lg:col-span-8 flex flex-col">
        <p className="text-ink2 leading-relaxed mb-8 max-w-2xl">
          {t('compass.assistant.intro')}
        </p>

        <div className="space-y-6 mb-6 min-h-[200px]">
          {thread.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {loading && (
            <Bubble role="assistant" content={t('compass.assistant.thinking')} pulse />
          )}
          {error && (
            <div className="border border-danger bg-paper2 p-4 text-sm text-danger">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={onSubmit} className="border-t border-rule pt-4">
          <label className="block font-mono text-[10.5px] tracking-wider uppercase text-muted mb-2">
            {t('compass.assistant.ask')}
          </label>
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('compass.assistant.placeholder')}
              rows={3}
              className="input-editorial text-base resize-y min-h-[80px]"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  send();
                }
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-mono text-[10px] text-muted tracking-wider">⌘ + ↵</span>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? t('compass.assistant.thinking') : t('compass.assistant.ask')}
              <ArrowIcon />
            </button>
          </div>
        </form>
      </div>

      {/* Example questions */}
      <aside className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-8">
        <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-4">
          {t('compass.assistant.examples_title')}
        </div>
        <div className="space-y-2">
          {exampleArr.map((q, i) => (
            <button
              key={i}
              onClick={() => send(q)}
              disabled={loading}
              className="block w-full text-start font-display italic text-[15px] leading-relaxed text-ink2 hover:text-sienna transition-colors border-b border-rule py-3 text-pretty"
            >
              &raquo;&nbsp;{q}
            </button>
          ))}
        </div>


      </aside>
    </div>
  );
}

function Bubble({ role, content, pulse }) {
  const isUser = role === 'user';
  return (
    <div className={['flex flex-col', isUser ? 'items-end' : 'items-start'].join(' ')}>
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted mb-1.5">
        {isUser ? '· du' : '· assistant'}
      </div>
      <div
        className={[
          'max-w-[92%] p-4 leading-relaxed text-[15px] text-pretty whitespace-pre-wrap',
          isUser
            ? 'bg-ink text-paper'
            : 'border border-rule bg-paper2/50 text-ink2',
          pulse && 'animate-pulse',
        ].filter(Boolean).join(' ')}
      >
        {content}
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" className="ms-2">
      <path d="M1 6.5h10M7 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

