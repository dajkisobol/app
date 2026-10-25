'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, ExternalLink, FileText, RotateCcw, Save, X } from 'lucide-react';
import { CERMAT_EXAMS, formatExamAnswer, isTaskAnswered, scoreExam, scoreTask, secondsRemaining, taskRows } from '@/lib/cermat';
import type { CermatExam, ExamAnswer, ExamAnswers, ExamTask } from '@/lib/cermat';

type Mode = 'timed' | 'practice';
interface Session {
  version: 1;
  examId: string;
  mode: Mode;
  startedAt: number;
  answers: ExamAnswers;
  submittedAt?: number;
  overrides: Record<number, number>;
  saved?: boolean;
}
interface MissedTask { examId: string; number: number }
export interface CermatResult { exam: CermatExam; score: number; seconds: number }
interface Props { storageKey: string; onResult: (result: CermatResult) => Promise<void> }

function readSession(key: string): Session | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (!value || value.version !== 1 || !CERMAT_EXAMS.some(e => e.id === value.examId)
      || !['timed', 'practice'].includes(value.mode) || !Number.isFinite(value.startedAt)
      || !value.answers || typeof value.answers !== 'object' || Array.isArray(value.answers)) return null;
    for (const answer of Object.values(value.answers)) {
      if (typeof answer === 'string') continue;
      if (!answer || typeof answer !== 'object' || Array.isArray(answer) || Object.values(answer).some(v => typeof v !== 'string')) return null;
    }
    return { ...value, overrides: value.overrides && typeof value.overrides === 'object' ? value.overrides : {} };
  } catch { return null; }
}

function getMissed(key: string): MissedTask[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(`${key}:missed`) || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is MissedTask => !!v && typeof v === 'object' && CERMAT_EXAMS.some(e => e.id === v.examId && e.tasks.some(t => t.number === v.number)));
  } catch { return []; }
}

export function AnswerFields({ task, value, onChange, disabled = false }: {
  task: ExamTask; value?: ExamAnswer; onChange: (value: ExamAnswer) => void; disabled?: boolean;
}) {
  if (task.kind === 'words') return (
    <label className="exam-field">
      Odpověď k úloze {task.number}
      <textarea rows={3} disabled={disabled} value={typeof value === 'string' ? value : ''} onChange={e => onChange(e.target.value)} placeholder="Jednotlivá slova odděl čárkou nebo novým řádkem." />
      <span>Pořadí slov nerozhoduje. I slovo navíc se počítá jako chyba.</span>
    </label>
  );
  const rows = task.kind === 'choice' ? [String(task.number)] : taskRows(task);
  const values = typeof value === 'object' ? value : {};
  return <div className="space-y-4">{rows.map(row => {
    const selected = task.kind === 'choice' ? typeof value === 'string' ? value : '' : values[row] || '';
    const change = (answer: string) => onChange(task.kind === 'choice' ? answer : { ...values, [row]: answer });
    return <fieldset key={row} disabled={disabled} className="exam-answer-row">
      <legend>{task.kind === 'order' ? `Pozice ${rows.indexOf(row) + 1}` : `Úloha ${row}`}</legend>
      {task.kind === 'text' ? <input aria-label={`Odpověď ${row}`} value={selected} onChange={e => change(e.target.value)} autoComplete="off" /> :
        <div className="exam-options">{task.options?.map(option => {
          const usedElsewhere = (task.kind === 'order' || task.kind === 'matching') && Object.entries(values).some(([key, answer]) => key !== row && answer === option);
          return <label key={option} className={`exam-option ${selected === option ? 'is-selected' : ''} ${usedElsewhere ? 'is-used' : ''}`}>
            <input type="radio" name={`answer-${task.number}-${row}`} value={option} checked={selected === option} onChange={() => change(option)} />
            {task.kind === 'binary' ? option === 'A' ? 'A · Ano' : 'N · Ne' : option}
            {usedElsewhere && <span className="sr-only"> (už použito u jiné podúlohy)</span>}
          </label>;
        })}</div>}
    </fieldset>;
  })}</div>;
}

function taskLabel(task: ExamTask) {
  return ({ choice: 'Výběr A–D', binary: 'Pravdivost tvrzení A / N', matching: 'Přiřazování', order: 'Řazení částí textu', words: 'Otevřená odpověď — výpis slov', text: 'Otevřené odpovědi' })[task.kind];
}

function ScoreRules({ task }: { task: ExamTask }) {
  return <p className="exam-hint">{task.kind === 'binary' ? '4 správná tvrzení = 2 body, 3 = 1 bod, jinak 0 bodů.'
    : task.kind === 'order' ? '3 body pouze za celé správné pořadí. Každé písmeno použij právě jednou.'
    : task.kind === 'words' ? `Maximum ${task.points} b. Za chybějící i nadbytečné slovo se odečítá bod.${task.ignoreDiacritics ? ' Klíč připouští chybnou diakritiku.' : 'Slova musí být zapsána pravopisně správně.'}`
    : task.kind === 'matching' ? 'Za každé správné přiřazení 1 bod. Jedno písmeno nesmí být přiřazeno víckrát.'
    : task.kind === 'text' ? 'Za každou správnou podúlohu 1 bod. Klíč připouští chybnou diakritiku.' : 'Právě jedna možnost je správná. Správná odpověď = 1 bod.'}</p>;
}

function SubmitDialog({ unanswered, onCancel, onSubmit }: { unanswered: number; onCancel: () => void; onSubmit: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return <dialog ref={dialog} className="exam-dialog" aria-labelledby="submit-title" onCancel={onCancel}>
    <h3 id="submit-title">Odevzdat test?</h3>
    <p>{unanswered ? `${unanswered} úloh zatím není kompletně vyplněno. Prázdné odpovědi budou hodnoceny jako chybné.` : 'Všechny úlohy jsou vyplněné.'} Po odevzdání už odpovědi nelze měnit.</p>
    <div className="flex flex-wrap gap-3"><button className="hero-secondary" autoFocus onClick={onCancel}>Ještě zkontrolovat</button><button className="hero-primary" onClick={onSubmit}>Odevzdat test</button></div>
  </dialog>;
}

export default function CermatTests({ storageKey, onResult }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [resume, setResume] = useState<Session | null>(null);
  useEffect(() => {
    // Restore an external browser-storage snapshot after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResume(readSession(storageKey));
  }, [storageKey]);

  if (session) return <ExamRunner key={`${session.examId}-${session.startedAt}`} initial={session} storageKey={storageKey} onResult={onResult} onBack={() => { setResume(readSession(storageKey)); setSession(null); }} />;
  return <section className="space-y-6" aria-labelledby="exam-library-title">
    <div className="exam-library-heading"><span className="eyebrow">CELOU ZKOUŠKU SI MŮŽEŠ ZKUSIT NANEČISTO</span><h2 id="exam-library-title">Didaktické testy CERMAT</h2>
      <p>Kompletní oficiální zadání včetně všech výchozích textů. <strong>32 úloh, 50 bodů, 85 minut.</strong> Číslo 50 označuje body, nikoli počet otázek.</p>
    </div>
    {resume && <div className="exam-resume"><div><strong>{resume.submittedAt ? 'Poslední vyhodnocený test' : 'Máš tu rozpracovaný test'}</strong><p>{CERMAT_EXAMS.find(e => e.id === resume.examId)?.title} · {resume.mode === 'timed' ? 'S časovým limitem' : 'Bez časového limitu'}{!resume.submittedAt && resume.mode === 'timed' ? ' · Čas běží i při zavření stránky.' : ''}</p></div><button className="hero-primary" onClick={() => setSession(resume)}>{resume.submittedAt ? 'Zobrazit výsledek' : 'Pokračovat'}</button></div>}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{CERMAT_EXAMS.map(exam => <article key={exam.id} className="exam-library-card study-card">
      <div className="flex items-center justify-between gap-3"><span className="eyebrow">{exam.season} {exam.year}</span><FileText className="h-6 w-6 text-[var(--sage-ink)]" /></div>
      <h3>{exam.title}</h3><p className="exam-hint">Oficiální test CZVV · {exam.code}</p>
      <div className="exam-facts"><span>32 úloh</span><span>50 bodů</span><span>85 minut</span><span>{exam.pages} stran zadání</span></div>
      <p>Celý originální sešit a vlastní odpovědní arch. Výběr odpovědí, A/N, přiřazování, řazení i otevřené úlohy.</p>
      <div className="flex flex-wrap gap-3">{(['timed', 'practice'] as Mode[]).map(mode => <button key={mode} className={mode === 'timed' ? 'hero-primary' : 'hero-secondary'} onClick={() => setSession({ version: 1, examId: exam.id, mode, startedAt: Date.now(), answers: {}, overrides: {} })}>{mode === 'timed' ? <><Clock size={15} /> Zkusit test na čas</> : 'Trénovat bez času'}</button>)}</div>
      <a className="exam-source-link" href={exam.sourceUrl} target="_blank" rel="noopener noreferrer">Zdroj: archiv CERMAT <ExternalLink size={13} /></a>
    </article>)}</div>
    <p className="exam-hint">Zadání se načítá přímo z maturita.cermat.cz, proto potřebuješ připojení k internetu. Rozpracované odpovědi se ukládají v tomto prohlížeči. Jde o neoficiální procvičovací prostředí; autorem zadání je CZVV.</p>
  </section>;
}

function ExamRunner({ initial, storageKey, onResult, onBack }: Props & { initial: Session; onBack: () => void }) {
  const exam = CERMAT_EXAMS.find(e => e.id === initial.examId)!;
  const [session, setSession] = useState(initial);
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(exam.tasks[0].passagePage ?? exam.tasks[0].page);
  const [now, setNow] = useState(Date.now);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [storageError, setStorageError] = useState(false);
  const savingRef = useRef(false);
  const submitted = !!session.submittedAt;
  const task = exam.tasks[index];
  const remaining = secondsRemaining(session.startedAt, exam.minutes, now);
  const answered = exam.tasks.filter(t => isTaskAnswered(t, session.answers[t.number])).length;
  const result = scoreExam(exam, session.answers);
  const taskPoints = (t: ExamTask) => Number.isInteger(session.overrides[t.number]) && session.overrides[t.number] >= 0 && session.overrides[t.number] <= t.points ? session.overrides[t.number] : scoreTask(t, session.answers[t.number]).points;
  const score = exam.tasks.reduce((sum, t) => sum + taskPoints(t), 0);
  const elapsed = Math.max(0, Math.floor(((session.submittedAt || now) - session.startedAt) / 1000));

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(session)); }
    catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Surface a failed browser-storage write.
      setStorageError(true);
    }
  }, [session, storageKey]);
  useEffect(() => {
    if (submitted) return;
    const tick = () => {
      const time = Date.now(); setNow(time);
      if (initial.mode === 'timed' && secondsRemaining(initial.startedAt, exam.minutes, time) === 0) {
        setSession(s => s.submittedAt ? s : { ...s, submittedAt: s.startedAt + exam.minutes * 60_000 });
        setConfirmSubmit(false);
      }
    };
    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [exam.minutes, initial.mode, initial.startedAt, submitted]);

  const chooseTask = (next: number) => { setIndex(next); setPage(exam.tasks[next].passagePage ?? exam.tasks[next].page); };
  const saveResult = async () => {
    if (savingRef.current || session.saved) return;
    savingRef.current = true; setSaving(true); setMessage('');
    try {
      const other = getMissed(storageKey).filter(m => m.examId !== exam.id);
      const missed = exam.tasks.filter(t => taskPoints(t) < t.points).map(t => ({ examId: exam.id, number: t.number }));
      localStorage.setItem(`${storageKey}:missed`, JSON.stringify([...other, ...missed]));
      await onResult({ exam, score, seconds: initial.mode === 'timed' ? Math.min(elapsed, exam.minutes * 60) : elapsed });
      setSession(s => ({ ...s, saved: true }));
      setMessage('Výsledek a chybné úlohy jsou uložené. Chyby najdeš v Procvičování chyb.');
    } catch { setMessage('Výsledek se nepodařilo uložit. Odpovědi zůstávají v testu; zkus to znovu.'); }
    finally { savingRef.current = false; setSaving(false); }
  };
  const pdfUrl = `${exam.bookletUrl}#page=${page}&view=FitH`;
  return <section className="exam-runner space-y-5">
    <div className="exam-toolbar"><button className="exam-source-link" onClick={onBack}><ArrowLeft size={16} /> Přehled testů</button><div><h2>{exam.title}</h2><p>{exam.code} · {submitted ? 'Vyhodnoceno' : `${answered} z 32 úloh vyplněno`}</p></div><div className={`exam-clock ${remaining < 300 && initial.mode === 'timed' && !submitted ? 'is-urgent' : ''}`}><Clock size={16} />{submitted ? `${Math.floor(elapsed / 60)} min` : initial.mode === 'timed' ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : 'Bez limitu'}</div></div>
    {storageError && <p role="alert" className="exam-notice">Prohlížeč nedovolil uložit odpovědi. Před dokončením nezavírej tuto stránku.</p>}
    {submitted && <div className="exam-result" role="status"><div><span className="eyebrow">VÝSLEDEK PROCVIČOVÁNÍ</span><h3>{score} / 50 bodů <span>({Math.round(score / 50 * 100)} %)</span></h3><p>{score >= exam.passPoints ? 'Dosáhl/a jsi hranice úspěšnosti 22 bodů.' : 'K hranici úspěšnosti 22 bodů ještě zbývá trénink.'}</p><p>Automatické hodnocení ověř u otevřených úloh podle klíče, zejména u jiných náležitých tvarů slov. Body lze po vlastní kontrole opravit.</p></div><button className="hero-primary" disabled={saving || session.saved} onClick={saveResult}><Save size={16} />{session.saved ? 'Výsledek uložen' : saving ? 'Ukládám…' : 'Uložit výsledek a chyby'}</button></div>}
    {message && <p role="status" className="exam-notice">{message}</p>}
    <div className="exam-workspace">
      <div className="exam-booklet">
        <div className="exam-booklet-heading"><div><h3>Celé zadání a výchozí texty</h3><p>Originální testový sešit · CZVV · {exam.pages} stran</p></div><a href={exam.bookletUrl} target="_blank" rel="noopener noreferrer" className="exam-source-link">Otevřít celé PDF <ExternalLink size={14} /></a></div>
        <div className="exam-page-controls"><label>Strana <select aria-label="Strana zadání" value={page} onChange={e => setPage(Number(e.target.value))}>{Array.from({ length: exam.pages }, (_, i) => <option key={i} value={i + 1}>{i + 1} / {exam.pages}</option>)}</select></label><button className="exam-source-link" onClick={() => setPage(task.passagePage ?? task.page)}>Výchozí text k úloze {task.number}</button><button className="exam-source-link" onClick={() => setPage(task.page)}>Zadání úlohy {task.number}</button></div>
        <iframe key={pdfUrl} src={pdfUrl} title={`Úplné zadání: ${exam.title}, strana ${page}`} className="exam-pdf" />
        <p className="exam-pdf-help">Nezobrazuje se celý sešit nebo nejde posouvat? <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Otevři zadání v nové kartě</a> a odpovědi vyplňuj tady. PDF obsahuje všechny výchozí texty i pokyny; nic není zkráceno.</p>
      </div>
      <div className="exam-answer-sheet">
        <h3>Odpovědní arch</h3><p className="exam-hint">Čísla odpovídají originálnímu zadání. Vyber úlohu a její text si přečti v sešitě.</p>
        <nav className="exam-question-grid" aria-label="Výběr úlohy">{exam.tasks.map((t, i) => <button key={t.number} aria-label={`Úloha ${t.number}${isTaskAnswered(t, session.answers[t.number]) ? ', vyplněno' : ''}`} aria-current={i === index ? 'step' : undefined} onClick={() => chooseTask(i)} className={`${i === index ? 'is-current' : ''} ${isTaskAnswered(t, session.answers[t.number]) ? 'is-answered' : ''} ${submitted ? taskPoints(t) === t.points ? 'is-correct' : 'is-incorrect' : ''}`}>{t.number}</button>)}</nav>
        <div className="exam-task-header"><h4>Úloha {task.number}</h4><span>{submitted ? `${taskPoints(task)} / ` : 'max. '}{task.points} b.</span></div>
        <p className="exam-task-kind">{taskLabel(task)}</p><ScoreRules task={task} />
        <AnswerFields key={task.number} task={task} value={session.answers[task.number]} disabled={submitted} onChange={value => setSession(s => ({ ...s, answers: { ...s.answers, [task.number]: value } }))} />
        {!submitted && <button className="exam-clear" onClick={() => setSession(s => { const answers = { ...s.answers }; delete answers[task.number]; return { ...s, answers }; })}><X size={13} /> Vymazat odpověď</button>}
        {submitted && <div className="exam-solution"><h4>Řešení podle oficiálního klíče</h4><p>{task.kind === 'choice' || task.kind === 'words' ? task.correct.join(', ') : taskRows(task).map((row, i) => `${row}: ${task.correct[i]}`).join(' · ')}</p><p className="exam-hint">Tvoje odpověď: {formatExamAnswer(task, session.answers[task.number])}</p>
          <a href={exam.keyUrl} target="_blank" rel="noopener noreferrer" className="exam-source-link">Oficiální klíč a pravidla <ExternalLink size={12} /></a><a href={exam.commentaryUrl} target="_blank" rel="noopener noreferrer" className="exam-source-link">Komentované řešení <ExternalLink size={12} /></a>
          {(task.kind === 'words' || task.kind === 'text') && <label className="exam-field">Body po vlastní kontrole klíče<select disabled={session.saved} value={taskPoints(task)} onChange={e => setSession(s => ({ ...s, overrides: { ...s.overrides, [task.number]: Number(e.target.value) } }))}>{Array.from({ length: task.points + 1 }, (_, p) => <option key={p} value={p}>{p} / {task.points}</option>)}</select><span>Automaticky přiděleno {result.tasks[index].points} b.{task.manualReview ? ' Jiné náležité tvary mohou vyžadovat ruční kontrolu.' : ''}</span></label>}
        </div>}
        <div className="exam-task-navigation"><button className="hero-secondary" disabled={index === 0} onClick={() => chooseTask(index - 1)}><ArrowLeft size={14} /> Zpět</button><button className="hero-secondary" disabled={index === exam.tasks.length - 1} onClick={() => chooseTask(index + 1)}>Další <ArrowRight size={14} /></button></div>
        {!submitted && <button className="hero-primary w-full mt-4" onClick={() => setConfirmSubmit(true)}><CheckCircle size={16} /> Odevzdat a vyhodnotit</button>}
      </div>
    </div>
    {confirmSubmit && !submitted && <SubmitDialog unanswered={32 - answered} onCancel={() => setConfirmSubmit(false)} onSubmit={() => { setSession(s => ({ ...s, submittedAt: Date.now() })); setConfirmSubmit(false); }} />}
  </section>;
}

export function CermatMistakes({ storageKey }: { storageKey: string }) {
  const [missed, setMissed] = useState<MissedTask[]>([]);
  const [value, setValue] = useState<ExamAnswer>('');
  const [showSolution, setShowSolution] = useState(false);
  const [position, setPosition] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronize saved mistakes when the practice tab mounts.
    setMissed(getMissed(storageKey));
  }, [storageKey]);
  const missedTask = missed[position];
  const exam = CERMAT_EXAMS.find(e => e.id === missedTask?.examId);
  const task = exam?.tasks.find(t => t.number === missedTask?.number);
  const [writeError, setWriteError] = useState(false);
  if (!task || !exam) return <div className="exam-practice-empty"><CheckCircle size={24} /><p>Z kompletních CERMAT testů tu zatím nemáš uložené chyby. Po vyhodnocení testu zvol „Uložit výsledek a chyby“.</p></div>;
  const next = () => { setPosition(p => (p + 1) % missed.length); setValue(''); setShowSolution(false); };
  return <section className="exam-practice space-y-4"><div className="flex flex-wrap gap-3 justify-between"><h3>Chyby z kompletních testů</h3><span>{position + 1} / {missed.length} · uložené v tomto prohlížeči</span></div><p>{exam.title} · Úloha {task.number}</p><a className="exam-source-link" target="_blank" rel="noopener noreferrer" href={`${exam.bookletUrl}#page=${task.passagePage ?? task.page}`}>Přečíst celé zadání a výchozí text <ExternalLink size={14} /></a><ScoreRules task={task} /><AnswerFields task={task} value={value} onChange={setValue} disabled={showSolution} />
    {!showSolution ? <button className="hero-primary" onClick={() => setShowSolution(true)}>Zkontrolovat odpověď</button> : <div className="exam-solution"><strong>{scoreTask(task, value).points} / {task.points} b.</strong><p>Řešení: {task.correct.join(' · ')}</p><a className="exam-source-link" target="_blank" rel="noopener noreferrer" href={exam.keyUrl}>Ověřit podle úplného klíče <ExternalLink size={12} /></a><p className="exam-hint">U otevřených úloh ověř i další přípustné tvary v oficiálním klíči.</p><button className="hero-primary" onClick={() => { const rest = missed.filter((_, i) => i !== position); try { localStorage.setItem(`${storageKey}:missed`, JSON.stringify(rest)); setMissed(rest); setPosition(0); setValue(''); setShowSolution(false); setWriteError(false); } catch { setWriteError(true); } }}>Už umím, vyřadit</button></div>}
    {writeError && <p role="alert">Prohlížeč nedovolil uložit změnu. Zkus to znovu.</p>}<button className="hero-secondary" onClick={next}><RotateCcw size={14} /> Další uložená úloha</button>
  </section>;
}
