'use client';

import Image from 'next/image';
import readingCorner from '@/assets/reading-cutout.webp';
import brandLockup from '@/assets/brand-lockup.webp';
import brandRibbon from '@/assets/brand-ribbon.webp';
import homeMotto from '@/assets/home-motto.webp';
import homeSignature from '@/assets/home-signature.webp';
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  GraduationCap,
  AlertCircle,
  Headphones,
  CheckCircle,
  LogOut,
  Moon,
  Sun,
  Printer,
  Plus,
  ChevronRight,
  User,
  BarChart3,
  Search,
  Check,
  X
} from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';
import type { AudioBook } from '@/components/AudioPlayer';
import MediaLibrary, { BookMediaPanel } from '@/components/BookMedia';
import CermatTests, { CermatMistakes } from '@/components/CermatTests';
import { supabase } from '@/lib/supabase';
import { BOOK_CATALOG, getDatabaseLinksForBook } from '@/lib/data';
import { getExtendedAnalysis } from '@/lib/book-analyses';

interface UserState {
  id: string;
  username: string;
  email: string;
  isGuest?: boolean;
}

interface MissedQuestion {
  id: string;
  missedRecordId?: string;
  test_id?: string;
  category: string;
  prompt: string;
  passage?: string;
  options: string[];
  correctOption: number;
  explanation: string;
  timesFailed?: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  period: string;
  genre: string;
  timeAndPlace: string;
  themeAndMotifs: string;
  characters: string;
  plotSummary: string;
  languageAndStyle: string;
}

export default function Home() {
  const [user, setUser] = useState<UserState | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tests' | 'errors' | 'books' | 'resources'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Weakness / Errors State
  const [errorQuestions, setErrorQuestions] = useState<MissedQuestion[]>([]);
  const [errorCategory, setErrorCategory] = useState<string>('vse');
  const [activeErrorIndex, setActiveErrorIndex] = useState(0);
  const [errorSelectedAnswer, setErrorSelectedAnswer] = useState<number | null>(null);
  const [errorShowExplanation, setErrorShowExplanation] = useState(false);

  // Books State
  const [catalogBooks, setCatalogBooks] = useState<Book[]>([]);
  const [userBookIds, setUserBookIds] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [selectedBookDetail, setSelectedBookDetail] = useState<Book | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('vse');
  const [bookPage, setBookPage] = useState<number>(1);

  const [activeAudio, setActiveAudio] = useState<AudioBook | null>(null);

  useEffect(() => {
    const openLinkedSection = () => {
      if (window.location.hash === '#audioknihy') setActiveTab('resources');
      else if (window.location.hash === '#testy') setActiveTab('tests');
    };
    openLinkedSection();
    window.addEventListener('hashchange', openLinkedSection);
    return () => window.removeEventListener('hashchange', openLinkedSection);
  }, []);

  // Initial Data Load
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setCatalogBooks(BOOK_CATALOG as Book[]);

      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setUser({
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Student',
            email: session.user.email || '',
          });
          return;
        }
      }

      const localGuest = localStorage.getItem('maturyta_guest_user');
      if (localGuest && isMounted) {
        try {
          setUser(JSON.parse(localGuest));
        } catch {
          // ignore
        }
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Books Data when User changes
  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    const loadUserBooks = async () => {
      if (supabase && !user.isGuest) {
        const { data, error } = await supabase
          .from('user_books')
          .select('book_id, custom_notes')
          .eq('user_id', user.id);

        if (!error && data && isMounted) {
          const ids = data.map((item) => item.book_id);
          const notesMap: Record<string, string> = {};
          data.forEach((item) => {
            if (item.custom_notes) notesMap[item.book_id] = item.custom_notes;
          });
          setUserBookIds(ids);
          setUserNotes(notesMap);
          return;
        }
      }

      const savedBooks = localStorage.getItem(`maturyta_user_books_${user.id}`);
      const savedNotes = localStorage.getItem(`maturyta_user_notes_${user.id}`);
      if (isMounted) {
        if (savedBooks) setUserBookIds(JSON.parse(savedBooks));
        if (savedNotes) setUserNotes(JSON.parse(savedNotes));
      }
    };

    loadUserBooks();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Load Errors Effect
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'errors' && user) {
      if (supabase && !user.isGuest) {
        let query = supabase
          .from('user_missed_questions')
          .select('*')
          .eq('user_id', user.id)
          .eq('mastered', false);

        if (errorCategory !== 'vse') {
          query = query.eq('category', errorCategory);
        }

        query.then(({ data, error }) => {
          if (!error && data && isMounted) {
            const formatted: MissedQuestion[] = data.map((r) => ({
              id: r.question_id,
              missedRecordId: r.id,
              test_id: r.test_id,
              category: r.category,
              prompt: r.prompt,
              options: typeof r.options_json === 'string' ? JSON.parse(r.options_json) : r.options_json,
              correctOption: r.correct_option,
              explanation: r.explanation,
              timesFailed: r.times_failed,
            }));
            setErrorQuestions(formatted);
            setActiveErrorIndex(0);
            setErrorSelectedAnswer(null);
            setErrorShowExplanation(false);
          }
        });
      } else {
        const savedErrors = localStorage.getItem(`maturyta_missed_${user.id}`);
        if (savedErrors && isMounted) {
          const timer = setTimeout(() => {
            if (isMounted) {
              let allMissed: MissedQuestion[] = JSON.parse(savedErrors);
              if (errorCategory !== 'vse') {
                allMissed = allMissed.filter((q) => q.category === errorCategory);
              }
              setErrorQuestions(allMissed);
              setActiveErrorIndex(0);
              setErrorSelectedAnswer(null);
              setErrorShowExplanation(false);
            }
          }, 0);
          return () => clearTimeout(timer);
        }
      }
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab, errorCategory, user]);

  const handleLogin = async (isGuest = false) => {
    setAuthError('');

    if (isGuest) {
      const guestUser: UserState = {
        id: 'guest_' + Date.now(),
        username: 'Student',
        email: 'demo@maturyta.cz',
        isGuest: true
      };
      localStorage.setItem('maturyta_guest_user', JSON.stringify(guestUser));
      setUser(guestUser);
      setShowAuthModal(false);
      return;
    }

    if (!username || !password) {
      setAuthError('Zadejte přihlašovací údaje.');
      return;
    }

    if (supabase) {
      const loginIdentifier = username.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginIdentifier,
        password: password,
      });

      if (error) {
        setAuthError('Chyba přihlášení: ' + error.message);
        return;
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          username: data.user.user_metadata?.username || username,
          email: data.user.email || '',
        });
        setShowAuthModal(false);
      }
    } else {
      setAuthError('Supabase není nakonfigurován. Použijte možnost "Vyzkoušet bez přihlášení".');
    }
  };

  const handleRegister = async () => {
    setAuthError('');
    if (!username || !email || !password) {
      setAuthError('Vyplňte všechna pole.');
      return;
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { username: username }
        }
      });

      if (error) {
        setAuthError('Chyba při registraci: ' + error.message);
        return;
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          username,
          email,
        });
        setShowAuthModal(false);
      }
    } else {
      setAuthError('Supabase není nakonfigurován. Použijte možnost "Vyzkoušet bez přihlášení".');
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('maturyta_guest_user');
    setUser(null);
  };

  const toggleBookSelection = async (bookId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const isSelected = userBookIds.includes(bookId);
    const newBookIds = isSelected ? userBookIds.filter((id) => id !== bookId) : [...userBookIds, bookId];
    setUserBookIds(newBookIds);

    if (supabase && !user.isGuest) {
      if (isSelected) {
        await supabase.from('user_books').delete().eq('user_id', user.id).eq('book_id', bookId);
      } else {
        await supabase.from('user_books').insert({ user_id: user.id, book_id: bookId });
      }
    } else {
      localStorage.setItem(`maturyta_user_books_${user.id}`, JSON.stringify(newBookIds));
    }
  };

  const saveBookNotes = async (bookId: string) => {
    if (!user) return;
    const newNotes = { ...userNotes, [bookId]: editingNotes };
    setUserNotes(newNotes);

    if (supabase && !user.isGuest) {
      await supabase.from('user_books').upsert({
        user_id: user.id,
        book_id: bookId,
        custom_notes: editingNotes
      });
    } else {
      localStorage.setItem(`maturyta_user_notes_${user.id}`, JSON.stringify(newNotes));
    }
  };

  const handleMasterErrorQuestion = async (qId: string) => {
    if (!user) return;

    const remaining = errorQuestions.filter((q) => q.id !== qId);
    setErrorQuestions(remaining);
    setActiveErrorIndex((prev) => (remaining.length > 0 ? prev % remaining.length : 0));
    setErrorSelectedAnswer(null);
    setErrorShowExplanation(false);

    if (supabase && !user.isGuest) {
      await supabase
        .from('user_missed_questions')
        .update({ mastered: true })
        .eq('user_id', user.id)
        .eq('question_id', qId);
    } else {
      const savedErrorsKey = `maturyta_missed_${user.id}`;
      const existingRaw = localStorage.getItem(savedErrorsKey);
      if (existingRaw) {
        const existingList: MissedQuestion[] = JSON.parse(existingRaw);
        const filtered = existingList.filter((q) => q.id !== qId);
        localStorage.setItem(savedErrorsKey, JSON.stringify(filtered));
      }
    }
  };

  const cardClass = 'study-card bg-[var(--surface)] border border-[var(--line)] transition-all duration-200';

  const currentErrorQuestion = errorQuestions[activeErrorIndex];

  const filteredBooks = catalogBooks.filter((b) => {
    const q = bookSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.period.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedPeriodFilter === 'my_list') {
      return userBookIds.includes(b.id);
    }
    if (selectedPeriodFilter === 'starsi') {
      return (
        b.period.includes('18. stol') ||
        b.period.includes('10. stol') ||
        b.period.includes('12. stol') ||
        b.period.includes('14. stol') ||
        b.period.includes('15. stol') ||
        b.period.includes('16. stol') ||
        b.period.includes('17. stol') ||
        b.period.includes('Starovek') ||
        b.period.includes('Starověk')
      );
    }
    if (selectedPeriodFilter === '19_stol') {
      return b.period.includes('19. stol') || b.period.includes('19. století');
    }
    if (selectedPeriodFilter === '20_21_stol') {
      return (
        b.period.includes('20. stol') ||
        b.period.includes('21. stol') ||
        b.period.includes('20. století') ||
        b.period.includes('21. století') ||
        b.period.includes('meziválečn') ||
        b.period.includes('povál')
      );
    }
    return true;
  });

  const BOOK_PAGE_SIZE = 12;
  const totalBookPages = Math.ceil(filteredBooks.length / BOOK_PAGE_SIZE) || 1;
  const paginatedBooks = filteredBooks.slice(
    (bookPage - 1) * BOOK_PAGE_SIZE,
    bookPage * BOOK_PAGE_SIZE
  );

  return (
    <div data-theme={darkMode ? "dark" : "light"} className="app-shell min-h-screen flex flex-col font-sans transition-colors duration-200 pb-28">
      {/* HEADER NAVBAR */}
      <header className="site-header sticky top-0 z-40 bg-[var(--page)]/95 backdrop-blur-md">
        <div className="site-header-inner">
          <button type="button" aria-label="MaturYta – úvodní přehled" className="brand-lockup" onClick={() => setActiveTab('dashboard')}>
            <Image src={brandLockup} alt="MaturYta" className="brand-lockup-image" preload sizes="(max-width: 380px) 126px, (max-width: 767px) 160px, 220px" />
          </button>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-[var(--surface-soft)]/30 p-1 rounded-xl border border-[var(--line)]/60">
            {[
              { id: 'dashboard', label: 'Přehled', icon: BarChart3 },
              { id: 'tests', label: 'Cermat Testy', icon: GraduationCap },
              { id: 'errors', label: 'Procvičování chyb', icon: AlertCircle },
              { id: 'books', label: 'Maturitní četba', icon: BookOpen },
              { id: 'resources', label: 'Zdroje & Audio', icon: Headphones }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'dashboard' | 'tests' | 'errors' | 'books' | 'resources')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? 'bg-[var(--mustard)] text-[#293643] shadow-sm font-extrabold'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-soft)]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* User & Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-[var(--line)] hover:bg-[var(--surface-soft)] text-[var(--muted)]"
              aria-label={darkMode ? "Zapnout světlý vzhled" : "Zapnout tmavý vzhled"}
              aria-pressed={darkMode}
              title="Přepnout vzhled"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[var(--mustard-ink)]" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-[var(--ink)]">{user.username}</span>
                  <span className="text-[10px] text-[var(--muted)]">{user.isGuest ? 'Anonymní účet' : user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--coral-ink)] hover:bg-[var(--coral)]/10 border border-[var(--line)]/80 transition-colors"
                  title="Odhlásit se"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--mustard)] hover:bg-[var(--mustard-hover)] text-[#293643] font-bold text-xs transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                Přihlásit se
              </button>
            )}
          </div>
        </div>
      </header>
      <div className="brand-ribbon" aria-hidden="true" style={{ backgroundImage: `url("${brandRibbon.src}")` }} />

      {/* MOBILE BOTTOM NAV */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--page)]/95 border-t border-[var(--line)]/80 px-2 py-1.5 flex justify-around backdrop-blur-md">
        {[
          { id: 'dashboard', label: 'Přehled', icon: BarChart3 },
          { id: 'tests', label: 'Testy', icon: GraduationCap },
          { id: 'errors', label: 'Chyby', icon: AlertCircle },
          { id: 'books', label: 'Četba', icon: BookOpen },
          { id: 'resources', label: 'Audio', icon: Headphones }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'dashboard' | 'tests' | 'errors' | 'books' | 'resources')}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-bold ${
                active ? 'text-[var(--mustard-ink)]' : 'text-[var(--muted)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <section className="reading-hero" aria-labelledby="welcome-heading">
              <div className="hero-copy">
                <span className="eyebrow"><span className="inline-block h-2 w-2 rounded-full bg-[var(--sage)]" /> TVŮJ KLIDNÝ KOUTEK NA UČENÍ</span>
                <h1 id="welcome-heading" className="hero-heading">
                  <span className="hero-motto">
                    <Image src={homeMotto} alt="Maturita, formalita. Psaní, čtení, komunita." preload sizes="(max-width: 767px) calc(100vw - 80px), 640px" />
                  </span>
                  <span className="hero-signature">
                    <Image src={homeSignature} alt="S MaturYtou realita." sizes="(max-width: 767px) calc(100vw - 80px), 460px" />
                  </span>
                </h1>
                <p>Udělej si pohodlí. Provedeme tě češtinou od prvního cvičného testu až po poslední knihu v maturitním seznamu.</p>
                <div className="hero-actions">
                  <button onClick={() => setActiveTab('tests')} className="hero-primary">
                    Pustit se do přípravy <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setActiveTab('books')} className="hero-secondary">
                    <BookOpen className="w-4 h-4" /> Vybrat si četbu
                  </button>
                </div>
                <div className="hero-footnote"><CheckCircle className="h-4 w-4" /> Vlastním tempem <span aria-hidden="true">·</span> Na jednom místě <span aria-hidden="true">·</span> Zdarma</div>
              </div>
              <figure className="hero-art">
                <Image src={readingCorner} alt="Čtenářka s knihou a čajem v oranžovém křesle pod petrolejovou lampou" sizes="(max-width: 767px) 72vw, 380px" className="reading-illustration" />
                <figcaption>Ještě jednu kapitolu…</figcaption>
              </figure>
            </section>

            <div className="section-intro">
              <div><span className="eyebrow">KAŽDÝ KROK SE POČÍTÁ</span><h2>Čím dnes začneme?</h2></div>
              <p>Trocha procvičování, nebo chvíle s knihou?</p>
            </div>

            {/* DASHBOARD CARDS */}
            <div className="dashboard-cards grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`p-6 rounded-2xl ${cardClass} space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-[var(--mustard)]/10 border border-[var(--mustard)]/20 text-[var(--mustard-ink)] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-[var(--ink)]">O kousek blíž k maturitě</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Oficiální testovací sady s reálným časovačem 85 minut nebo neomezeným tréninkovým režimem.
                </p>
                <button
                  onClick={() => setActiveTab('tests')}
                  className="text-xs font-extrabold text-[var(--mustard-ink)] hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Otevřít testy <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className={`p-6 rounded-2xl ${cardClass} space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-[var(--coral)]/10 border border-[var(--coral)]/20 text-[var(--coral-ink)] flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-[var(--ink)]">Z chyb se učíme</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Automatický chybovník ukládá nezvládnuté otázky a vrací je v opakovaných cyklech do plného naučení.
                </p>
                <button
                  onClick={() => setActiveTab('errors')}
                  className="text-xs font-extrabold text-[var(--coral-ink)] hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Procvičit uložené chyby <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className={`p-6 rounded-2xl ${cardClass} space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-[var(--sage)]/10 border border-[var(--sage)]/20 text-[var(--sage-ink)] flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-[var(--ink)]">Příběhy do očí i do uší</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  České e-knihy přímo v aplikaci, čtečka s předčítáním a přehrávač vlastních audioknih.
                </p>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="text-xs font-extrabold text-[var(--sage-ink)] hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Procházet zdroje <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete official exam booklets and interactive answer sheets */}
        <div hidden={activeTab !== 'tests'}>
          <CermatTests
            key={user?.id ?? 'anonymous'}
            storageKey={`maturyta_cermat_v1_${user?.id ?? 'anonymous'}`}
            onResult={async ({ exam, score, seconds }) => {
              if (supabase && user && !user.isGuest) {
                const { error } = await supabase.from('test_results').insert({
                  user_id: user.id, test_id: exam.id, test_title: exam.title,
                  score, total_questions: exam.tasks.length, time_spent_seconds: seconds,
                });
                if (error) throw error;
              }
            }}
          />
        </div>

        {/* ERROR PRACTICE TAB */}
        {activeTab === 'errors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Procvičování chyb (Chybovník)</h2>
              <p className="text-xs text-[var(--muted)]">Otázky, ve kterých jsi v minulosti chyboval/a. Jakmile otázku zvládneš, vyřaď ji tlačítkem.</p>
            </div>

            <CermatMistakes key={user?.id ?? 'anonymous'} storageKey={`maturyta_cermat_v1_${user?.id ?? 'anonymous'}`} />

            {errorQuestions.length > 0 && <h3 className="font-bold">Dříve uložené cvičné otázky</h3>}
            {/* CATEGORY FILTER */}
            <div className="flex flex-wrap gap-2">
              {['vse', 'Pravopis', 'Literatura', 'Mluvnice', 'Textová návaznost'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setErrorCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    errorCategory === cat
                      ? 'bg-[var(--coral)] text-white shadow-sm'
                      : 'bg-[var(--surface-soft)]/40 text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
                  }`}
                >
                  {cat === 'vse' ? 'Všechny chyby' : cat}
                </button>
              ))}
            </div>

            {!currentErrorQuestion ? (
              <div className={`p-10 text-center rounded-2xl ${cardClass} space-y-3`}>
                <CheckCircle className="w-12 h-12 text-[var(--sage-ink)] mx-auto" />
                <h3 className="font-bold text-lg text-[var(--ink)]">Žádné starší cvičné otázky</h3>
                <p className="text-[var(--muted)] text-xs max-w-sm mx-auto leading-relaxed">
                  V této kategorii nemáš dříve uložené cvičné otázky. Chyby z kompletních CERMAT testů najdeš v samostatné části výše.
                </p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-5">
                <div className={`p-6 lg:p-8 rounded-2xl ${cardClass} space-y-5`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[var(--coral)]/10 text-[var(--coral-ink)] border border-[var(--coral)]/20">
                      {currentErrorQuestion.category}
                    </span>
                    <span className="text-xs text-[var(--muted)] font-mono">
                      {activeErrorIndex + 1} z {errorQuestions.length}
                    </span>
                  </div>

                  {currentErrorQuestion.passage && <div className="exam-legacy-passage"><h4>Výchozí text</h4><p>{currentErrorQuestion.passage}</p></div>}
                  <h3 className="text-base lg:text-lg font-bold leading-relaxed text-[var(--ink)]">
                    {currentErrorQuestion.prompt}
                  </h3>

                  <div className="space-y-2.5">
                    {currentErrorQuestion.options.map((opt: string, idx: number) => {
                      const isCorrect = idx === currentErrorQuestion.correctOption;
                      const isSelected = errorSelectedAnswer === idx;

                      let btnStyle = 'bg-[var(--surface-soft)]/40 border-[var(--line)] hover:border-[var(--line)] text-[var(--muted)]';
                      if (errorSelectedAnswer !== null) {
                        if (isCorrect) btnStyle = 'bg-[var(--sage)]/20 border-[var(--sage)] text-[var(--sage-ink)] font-bold';
                        else if (isSelected) btnStyle = 'bg-[var(--coral)]/20 border-[var(--coral)] text-[var(--coral-ink)] font-bold';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setErrorSelectedAnswer(idx);
                            setErrorShowExplanation(true);
                          }}
                          className={`w-full text-left p-4 rounded-xl border text-xs lg:text-sm font-semibold transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {errorShowExplanation && (
                    <div className="p-4 rounded-xl bg-[var(--surface-soft)]/80 space-y-1 text-xs border border-[var(--line)]/80">
                      <span className="font-bold text-[var(--mustard-ink)]">Vysvětlení:</span>
                      <p className="text-[var(--muted)] leading-relaxed font-normal">
                        {currentErrorQuestion.explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-[var(--line)]/80">
                    <button
                      onClick={() => handleMasterErrorQuestion(currentErrorQuestion.id)}
                      className="px-4 py-2 rounded-xl bg-[var(--sage)]/20 hover:bg-[var(--sage)]/30 text-[var(--sage-ink)] border border-[var(--sage)]/30 text-xs font-bold transition-colors"
                    >
                      Označit jako zvládnuté ✓
                    </button>

                    <button
                      onClick={() => {
                        setActiveErrorIndex((prev) => (prev + 1) % errorQuestions.length);
                        setErrorSelectedAnswer(null);
                        setErrorShowExplanation(false);
                      }}
                      className="px-5 py-2 rounded-xl bg-[var(--mustard)] hover:bg-[var(--mustard-hover)] text-[#293643] font-extrabold text-xs transition-colors"
                    >
                      Další chyba
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOOKS TAB */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Maturitní četba & Rozbory</h2>
                <p className="text-xs text-[var(--muted)]">Vyber si svých 20 maturitních knih a procházej rozbory děl, děje a časoprostoru.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={bookSearchQuery}
                    onChange={(e) => setBookSearchQuery(e.target.value)}
                    placeholder="Hledat autora či knihu..."
                    className="pl-8 pr-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--mustard)] w-48 sm:w-64"
                  />
                </div>

                <span className="text-xs font-bold px-3 py-2 rounded-xl bg-[var(--mustard)]/10 text-[var(--mustard-ink)] border border-[var(--mustard)]/20">
                  Vybráno: {userBookIds.length} / 20
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-[var(--surface-soft)]/60 hover:bg-[var(--surface-hover)]/80 text-[var(--muted)] text-xs font-bold flex items-center gap-1.5 border border-[var(--line)]/60"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Tisk
                </button>
              </div>
            </div>

            {/* CATEGORY & PERIOD FILTERS */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { id: 'vse', label: `Všechny tituly (${catalogBooks.length})` },
                { id: 'starsi', label: 'Do 18. století' },
                { id: '19_stol', label: '19. století' },
                { id: '20_21_stol', label: '20. a 21. století' },
                { id: 'my_list', label: `Moje vybrané (${userBookIds.length})` }
              ].map((filter) => {
                const active = selectedPeriodFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => {
                      setSelectedPeriodFilter(filter.id);
                      setBookPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      active
                        ? 'bg-[var(--mustard)] text-[#293643] border-[var(--mustard)] shadow-sm font-extrabold'
                        : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* RESULTS COUNTER */}
            <div className="flex justify-between items-center text-xs text-[var(--muted)]">
              <span>Nalezeno {filteredBooks.length} knih z celkem {catalogBooks.length}</span>
              {totalBookPages > 1 && (
                <span>Stránka {bookPage} z {totalBookPages}</span>
              )}
            </div>

            {/* CATALOG GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedBooks.map((book) => {
                const isSelected = userBookIds.includes(book.id);
                return (
                  <div
                    key={book.id}
                    className={`p-5 rounded-2xl ${cardClass} flex flex-col justify-between space-y-4`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--surface-soft)] text-[var(--muted)] border border-[var(--line)]/60">
                          {book.genre}
                        </span>
                        <button
                          onClick={() => toggleBookSelection(book.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isSelected ? 'bg-[var(--sage)]/20 text-[var(--sage-ink)] border-[var(--sage)]/40' : 'bg-[var(--surface-soft)]/40 text-[var(--muted)] border-[var(--line)]/60 hover:text-[var(--ink)]'
                          }`}
                          title={isSelected ? 'Odebrat ze seznamu' : 'Přidat do seznamu 20 knih'}
                        >
                          {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[var(--ink)]">{book.title}</h3>
                        <p className="text-xs text-[var(--mustard-ink)] font-semibold">{book.author}</p>
                      </div>

                      <p className="text-[11px] text-[var(--muted)] font-normal">{book.period}</p>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setSelectedBookDetail(book);
                          setEditingNotes(userNotes[book.id] || '');
                        }}
                        className="w-full py-2 rounded-xl bg-[var(--surface-soft)]/60 hover:bg-[var(--surface-hover)]/80 text-[var(--ink)] font-bold text-xs transition-colors border border-[var(--line)]/60"
                      >
                        Zobrazit podrobný rozbor
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalBookPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-4">
                <button
                  disabled={bookPage <= 1}
                  onClick={() => setBookPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--surface-soft)] transition-colors"
                >
                  Předchozí
                </button>
                <span className="text-xs font-bold text-[var(--muted)]">
                  Strana {bookPage} / {totalBookPages}
                </span>
                <button
                  disabled={bookPage >= totalBookPages}
                  onClick={() => setBookPage((p) => Math.min(totalBookPages, p + 1))}
                  className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--surface-soft)] transition-colors"
                >
                  Další
                </button>
              </div>
            )}

            {/* BOOK DETAIL MODAL */}
            {selectedBookDetail && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div className={`max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 lg:p-8 rounded-2xl ${cardClass} space-y-5 relative shadow-2xl bg-[var(--surface)] border border-[var(--line)]`}>
                  <button
                    onClick={() => setSelectedBookDetail(null)}
                    className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--coral-ink)] p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div>
                    <span className="text-[10px] font-bold text-[var(--sage-ink)] uppercase tracking-wider">{selectedBookDetail.period}</span>
                    <h2 className="text-2xl font-bold mt-0.5 text-[var(--ink)]">{selectedBookDetail.title}</h2>
                    <p className="text-[var(--mustard-ink)] font-semibold text-sm">{selectedBookDetail.author}</p>
                  </div>

                  <div className="space-y-3 text-xs text-[var(--muted)] font-normal">
                    <div className="p-3.5 rounded-xl bg-[var(--surface-soft)]/80 border border-[var(--line)]/80">
                      <strong className="text-[var(--ink)] block mb-0.5 font-bold">Žánr & Druh:</strong>
                      {selectedBookDetail.genre}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--surface-soft)]/80 border border-[var(--line)]/80">
                      <strong className="text-[var(--ink)] block mb-0.5 font-bold">Časoprostor:</strong>
                      {selectedBookDetail.timeAndPlace}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--surface-soft)]/80 border border-[var(--line)]/80">
                      <strong className="text-[var(--ink)] block mb-0.5 font-bold">Téma & Motivy:</strong>
                      {selectedBookDetail.themeAndMotifs}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--surface-soft)]/80 border border-[var(--line)]/80">
                      <strong className="text-[var(--ink)] block mb-0.5 font-bold">Hlavní postavy:</strong>
                      {selectedBookDetail.characters}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--surface-soft)]/80 border border-[var(--line)]/80">
                      <strong className="text-[var(--ink)] block mb-0.5 font-bold">Stručný děj:</strong>
                      <p className="leading-relaxed">{selectedBookDetail.plotSummary}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--surface-soft)]/80 border border-[var(--line)]/80">
                      <strong className="text-[var(--ink)] block mb-0.5 font-bold">Jazyk & Styl:</strong>
                      {selectedBookDetail.languageAndStyle}
                    </div>

                    {(() => {
                      const analysis = getExtendedAnalysis(selectedBookDetail);
                      if (!analysis) return null;
                      const sections = [
                        ['Literární druh a žánr', analysis.literaryType],
                        ['Kompozice', analysis.composition],
                        ['Vypravěč / promluvy', analysis.narrator],
                        ['Hlavní myšlenka', analysis.mainIdea],
                        ['Literárněhistorický kontext', analysis.historicalContext],
                        ['Charakteristika postav', analysis.characterAnalysis],
                        ['Podrobný děj', analysis.detailedPlot],
                      ];
                      return (
                        <section className="space-y-3" aria-label="Rozšířený maturitní rozbor">
                          <h3 className="text-lg font-bold text-[var(--ink)]">Rozšířený maturitní rozbor</h3>
                          {sections.map(([heading, body]) => (
                            <div key={heading} className="p-3.5 rounded-xl bg-[var(--surface-soft)]/80 border border-[var(--line)]/80 text-xs text-[var(--muted)]">
                              <strong className="text-[var(--ink)] block mb-1 font-bold">{heading}</strong>
                              <p className="leading-relaxed">{body}</p>
                            </div>
                          ))}
                          <p className="text-xs text-[var(--muted)]">
                            Vlastní studijní zpracování; použité podklady:{' '}
                            <a href={analysis.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--mustard-ink)]">
                              rozbor-dila.cz
                            </a>. Doporučujeme porovnat se samotným dílem.
                          </p>
                        </section>
                      );
                    })()}

                    <BookMediaPanel book={selectedBookDetail} owner={user?.id ?? 'anonymous'} onPlay={audio => { setActiveAudio(audio); setSelectedBookDetail(null); }} />

                    {/* DATABASE LOOKUP LINKS */}
                    <div className="p-3.5 rounded-xl bg-[var(--surface-soft)]/80 border border-[var(--line)]/80 space-y-3">
                      <strong className="text-[var(--ink)] block font-bold">Katalogové & Bibliografické databáze:</strong>

                      {/* CZECH PRIMARY SOURCES */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-[var(--mustard-ink)] uppercase tracking-wider block">České primární databáze</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {getDatabaseLinksForBook(selectedBookDetail)
                            .filter(link => link.category === 'czech')
                            .map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--line)] hover:border-[var(--line)] transition-all flex items-center justify-between text-xs group"
                              >
                                <div>
                                  <div className="font-bold text-[var(--ink)] group-hover:text-[var(--mustard-ink)] transition-colors">{link.name}</div>
                                  <div className="text-[10px] text-[var(--muted)]">{link.note}</div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--mustard-ink)]" />
                              </a>
                            ))}
                        </div>
                      </div>

                      {/* INTERNATIONAL COMPLEMENTARY SOURCES */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-[var(--sage-ink)] uppercase tracking-wider block">Mezinárodní bibliografické databáze</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {getDatabaseLinksForBook(selectedBookDetail)
                            .filter(link => link.category === 'international')
                            .map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--line)] hover:border-[var(--line)] transition-all flex items-center justify-between text-xs group"
                              >
                                <div>
                                  <div className="font-bold text-[var(--ink)] group-hover:text-[var(--sage-ink)] transition-colors">{link.name}</div>
                                  <div className="text-[10px] text-[var(--muted)]">{link.note}</div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--sage-ink)]" />
                              </a>
                            ))}
                        </div>
                      </div>
                    </div>

                    {user && (
                      <div className="pt-2">
                        <strong className="text-[var(--ink)] block mb-1 font-bold">Moje poznámky k dílu:</strong>
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          placeholder="Zadejte vlastní stručné poznámky k maturitní otázce..."
                          className="w-full p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] text-xs focus:outline-none focus:border-[var(--mustard)] text-[var(--ink)]"
                          rows={3}
                        />
                        <button
                          onClick={() => saveBookNotes(selectedBookDetail.id)}
                          className="mt-2 px-4 py-1.5 rounded-xl bg-[var(--mustard)] hover:bg-[var(--mustard-hover)] text-[#293643] font-bold text-xs"
                        >
                          Uložit poznámky
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Real book files, personal uploads and an honest availability catalog. */}
        {activeTab === 'resources' && <MediaLibrary books={BOOK_CATALOG} owner={user?.id ?? 'anonymous'} onPlay={setActiveAudio} />}
      </main>

      {activeAudio && <AudioPlayer key={`${activeAudio.title}:${activeAudio.tracks.map(t => t.title).join('|')}`} book={activeAudio} onClose={() => setActiveAudio(null)} />}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-sm w-full p-6 rounded-2xl ${cardClass} space-y-4 relative shadow-2xl bg-[var(--surface)] border border-[var(--line)]`}>
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--coral-ink)] p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[var(--ink)]">
                {authMode === 'login' ? 'Přihlášení do MaturYta' : 'Registrace nového účtu'}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Ukládej si testy, chybovník a vybranou četbu.
              </p>
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-[var(--coral)]/10 border border-[var(--coral)]/30 text-[var(--coral-ink)] text-xs font-semibold">
                {authError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">
                  Uživatelské jméno {authMode === 'login' && '/ E-mail'}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="JanNovak"
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] text-xs focus:outline-none focus:border-[var(--mustard)] text-[var(--ink)]"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@skola.cz"
                    className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] text-xs focus:outline-none focus:border-[var(--mustard)] text-[var(--ink)]"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">Heslo</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] text-xs focus:outline-none focus:border-[var(--mustard)] text-[var(--ink)]"
                />
              </div>

              <button
                onClick={() => (authMode === 'login' ? handleLogin(false) : handleRegister())}
                className="w-full py-2.5 rounded-xl bg-[var(--mustard)] hover:bg-[var(--mustard-hover)] text-[#293643] font-extrabold text-xs transition-transform active:scale-95 shadow-sm"
              >
                {authMode === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
              </button>

              <button
                onClick={() => handleLogin(true)}
                className="w-full py-2 rounded-xl bg-[var(--surface-soft)] hover:bg-[var(--surface-hover)]/80 text-[var(--muted)] font-bold text-xs border border-[var(--line)]/60 transition-colors"
              >
                Vyzkoušet bez přihlášení (Demo)
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs text-[var(--mustard-ink)] hover:underline font-bold"
              >
                {authMode === 'login' ? 'Nemáte účet? Zaregistrujte se' : 'Máte účet? Přihlaste se'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
