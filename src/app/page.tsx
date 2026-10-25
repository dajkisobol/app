'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  GraduationCap,
  AlertCircle,
  Headphones,
  CheckCircle,
  Clock,
  LogOut,
  Moon,
  Sun,
  Printer,
  Plus,
  Play,
  Download,
  ChevronRight,
  User,
  Sparkles,
  BarChart3,
  Award,
  BookCheck,
  RotateCcw,
  Search,
  Check,
  X
} from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';
import { supabase } from '@/lib/supabase';
import { BOOK_CATALOG, CERMAT_TESTS } from '@/lib/data';
import { FREE_RESOURCES } from '@/lib/resources';

interface UserState {
  id: string;
  username: string;
  email: string;
  isGuest?: boolean;
}

interface Question {
  id: string;
  category: string;
  prompt: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface DidacticTest {
  id: string;
  title: string;
  year: string;
  season: string;
  timeLimitMinutes: number;
  questions: Question[];
}

interface TestResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
}

interface MissedQuestion {
  id: string;
  missedRecordId?: string;
  test_id?: string;
  category: string;
  prompt: string;
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
  ebookUrl?: string;
  audiobookUrl?: string;
  audioSource?: string;
}

interface ResourceItem {
  id: string;
  title: string;
  author: string;
  type: 'ebook' | 'audiobook';
  format: string;
  sourceName: string;
  downloadUrl?: string;
  streamUrl?: string;
  description: string;
  coverColor: string;
}

export default function Home() {
  const [user, setUser] = useState<UserState | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tests' | 'errors' | 'books' | 'resources'>('dashboard');
  const [darkMode, setDarkMode] = useState(true);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Tests State
  const [tests, setTests] = useState<DidacticTest[]>([]);
  const [activeTest, setActiveTest] = useState<DidacticTest | null>(null);
  const [testMode, setTestMode] = useState<'timed' | 'untimed'>('timed');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(85 * 60);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

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

  // Resources / Audio State
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [activeAudio, setActiveAudio] = useState<{
    title: string;
    author: string;
    streamUrl: string;
    sourceName: string;
  } | null>(null);

  // Initial Data Load
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setResources(FREE_RESOURCES as ResourceItem[]);
      setTests(CERMAT_TESTS as DidacticTest[]);
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

  const submitTest = useCallback(async () => {
    if (!activeTest) return;
    let score = 0;
    const missedQuestions: Question[] = [];

    activeTest.questions.forEach((q) => {
      const userAns = selectedAnswers[q.id];
      if (userAns === q.correctOption) {
        score++;
      } else {
        missedQuestions.push(q);
      }
    });

    const totalQuestions = activeTest.questions.length;
    const timeSpentSeconds = (activeTest.timeLimitMinutes * 60) - timeLeft;

    setIsTestSubmitted(true);
    setTestResult({
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      timeSpentSeconds
    });

    if (user) {
      if (supabase && !user.isGuest) {
        await supabase.from('test_results').insert({
          user_id: user.id,
          test_id: activeTest.id,
          test_title: activeTest.title,
          score,
          total_questions: totalQuestions,
          time_spent_seconds: timeSpentSeconds
        });

        for (const q of missedQuestions) {
          const { data: existing } = await supabase
            .from('user_missed_questions')
            .select('id, times_failed')
            .eq('user_id', user.id)
            .eq('question_id', q.id)
            .single();

          if (existing) {
            await supabase
              .from('user_missed_questions')
              .update({ times_failed: existing.times_failed + 1, mastered: false })
              .eq('id', existing.id);
          } else {
            await supabase.from('user_missed_questions').insert({
              user_id: user.id,
              question_id: q.id,
              test_id: activeTest.id,
              category: q.category,
              prompt: q.prompt,
              options_json: JSON.stringify(q.options),
              correct_option: q.correctOption,
              explanation: q.explanation,
              times_failed: 1,
              mastered: false
            });
          }
        }
      } else {
        const savedErrorsKey = `maturyta_missed_${user.id}`;
        const existingRaw = localStorage.getItem(savedErrorsKey);
        const existingList: MissedQuestion[] = existingRaw ? JSON.parse(existingRaw) : [];

        missedQuestions.forEach((q) => {
          const idx = existingList.findIndex((item) => item.id === q.id);
          if (idx >= 0) {
            existingList[idx].timesFailed = (existingList[idx].timesFailed || 1) + 1;
          } else {
            existingList.push({ ...q, timesFailed: 1 });
          }
        });
        localStorage.setItem(savedErrorsKey, JSON.stringify(existingList));
      }
    }
  }, [activeTest, selectedAnswers, timeLeft, user]);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTest && testMode === 'timed' && !isTestSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTest, testMode, isTestSubmitted, timeLeft, submitTest]);

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

  const startTest = (test: DidacticTest, mode: 'timed' | 'untimed') => {
    setActiveTest(test);
    setTestMode(mode);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft((test.timeLimitMinutes || 85) * 60);
    setIsTestSubmitted(false);
    setTestResult(null);
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

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const themeClass = darkMode
    ? 'bg-[#0f172a] text-slate-100'
    : 'bg-[#f8fafc] text-slate-900';

  const cardClass = darkMode
    ? 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200'
    : 'bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all duration-200';

  const currentErrorQuestion = errorQuestions[activeErrorIndex];

  const filteredBooks = catalogBooks.filter((b) =>
    b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
    b.period.toLowerCase().includes(bookSearchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${themeClass} flex flex-col font-sans transition-colors duration-200 pb-28`}>
      {/* SLIM ACCENT TOP STRIP */}
      <div className="h-1 w-full bg-gradient-to-r from-[#f5b82e] via-[#ef6453] to-[#68baaa]" />

      {/* HEADER NAVBAR */}
      <header className={`sticky top-0 z-40 border-b ${darkMode ? 'bg-[#0f172a]/90 border-slate-800/80' : 'bg-white/90 border-slate-200'} backdrop-blur-md px-4 lg:px-8 py-3.5`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-[#f5b82e] text-slate-950 flex items-center justify-center font-black text-xl shadow-sm">
              M
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-100">
                Matur<span className="text-[#f5b82e]">Yta</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f5b82e]/10 text-[#f5b82e] border border-[#f5b82e]/20 uppercase tracking-wide">
                Český Jazyk
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/30 p-1 rounded-xl border border-slate-800/60">
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
                      ? 'bg-[#f5b82e] text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
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
              className={`p-2 rounded-xl border ${darkMode ? 'border-slate-800/80 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
              title="Přepnout vzhled"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#f5b82e]" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200">{user.username}</span>
                  <span className="text-[10px] text-slate-400">{user.isGuest ? 'Anonymní účet' : user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-[#ef6453] hover:bg-[#ef6453]/10 border border-slate-800/80 transition-colors"
                  title="Odhlásit se"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-bold text-xs transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                Přihlásit se
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/95 border-t border-slate-800/80 px-2 py-1.5 flex justify-around backdrop-blur-md">
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
                active ? 'text-[#f5b82e]' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* HERO HERO BANNER */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/80 p-6 lg:p-10">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5b82e]/10 text-[#f5b82e] border border-[#f5b82e]/20 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Maturitní příprava 2025
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-slate-100">
                  Připrav se na maturitu z českého jazyka
                </h1>
                <p className="text-slate-400 text-sm lg:text-base leading-relaxed font-normal">
                  Procvičuj originální CERMAT didaktické testy, odstraňuj své slabiny v inteligentním chybovníku a spravuj svůj maturitní seznam 20 knih s podrobnými rozbory a audiem zdarma.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('tests')}
                    className="px-5 py-2.5 rounded-xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-sm"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Spustit Cermat Test
                  </button>
                  <button
                    onClick={() => setActiveTab('books')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700/80 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-[#68baaa]" />
                    Moje maturitní četba ({userBookIds.length}/20)
                  </button>
                </div>
              </div>
            </div>

            {/* DASHBOARD CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`p-6 rounded-2xl ${cardClass} space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-[#f5b82e]/10 border border-[#f5b82e]/20 text-[#f5b82e] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-100">CERMAT Didaktické Testy</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Oficiální testovací sady s reálným časovačem 85 minut nebo neomezeným tréninkovým režimem.
                </p>
                <button
                  onClick={() => setActiveTab('tests')}
                  className="text-xs font-extrabold text-[#f5b82e] hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Otevřít testy <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className={`p-6 rounded-2xl ${cardClass} space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-[#ef6453]/10 border border-[#ef6453]/20 text-[#ef6453] flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-100">Procvičování chyb</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatický chybovník ukládá nezvládnuté otázky a vrací je v opakovaných cyklech do plného naučení.
                </p>
                <button
                  onClick={() => setActiveTab('errors')}
                  className="text-xs font-extrabold text-[#ef6453] hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Procvičit chyby ({errorQuestions.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className={`p-6 rounded-2xl ${cardClass} space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-[#68baaa]/10 border border-[#68baaa]/20 text-[#68baaa] flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-100">Zdroje & Audioknihy</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Legální e-knihy ke stažení (Městská knihovna v Praze) a nahrávky rozborů z Českého rozhlasu.
                </p>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="text-xs font-extrabold text-[#68baaa] hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Procházet zdroje <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CERMAT TESTS TAB */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            {!activeTest ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Didaktické testy CERMAT</h2>
                  <p className="text-xs text-slate-400">Vyber si test k procvičení. Můžeš zvolit oficiální ostrý režim s časem nebo neomezený trénink.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {tests.map((test) => (
                    <div key={test.id} className={`p-6 rounded-2xl ${cardClass} space-y-4`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#f5b82e]/10 text-[#f5b82e] border border-[#f5b82e]/20">
                            {test.season} {test.year}
                          </span>
                          <h3 className="text-lg font-bold mt-2 text-slate-100">{test.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#f5b82e]" />
                          {test.timeLimitMinutes} min
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        Obsahuje {test.questions.length} kompletních úloh zaměřených na Pravopis, Literární historii, Mluvnici a Textovou návaznost.
                      </p>

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                        <button
                          onClick={() => startTest(test, 'timed')}
                          className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#ef6453] hover:bg-[#d84e3d] text-white font-extrabold text-xs transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Ostrý test (85 min)
                        </button>
                        <button
                          onClick={() => startTest(test, 'untimed')}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-bold text-xs border border-slate-700/80 transition-colors"
                        >
                          Trénink bez času
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ACTIVE TEST RUNNER */
              <div className="max-w-3xl mx-auto space-y-6">
                <div className={`p-4 rounded-2xl ${cardClass} flex items-center justify-between`}>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{activeTest.title}</h3>
                    <p className="text-xs text-slate-400">
                      Otázka {currentQuestionIndex + 1} z {activeTest.questions.length}
                    </p>
                  </div>

                  {testMode === 'timed' && !isTestSubmitted && (
                    <div className="flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1.5 rounded-xl bg-[#f5b82e]/10 text-[#f5b82e] border border-[#f5b82e]/20">
                      <Clock className="w-4 h-4 animate-pulse" />
                      {formatSeconds(timeLeft)}
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTest(null)}
                    className="text-xs text-[#ef6453] hover:underline font-bold"
                  >
                    Ukončit test
                  </button>
                </div>

                {!isTestSubmitted ? (
                  <div className={`p-6 lg:p-8 rounded-2xl ${cardClass} space-y-6`}>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#68baaa]/10 text-[#68baaa] border border-[#68baaa]/20">
                        {activeTest.questions[currentQuestionIndex].category}
                      </span>
                      <h2 className="text-lg lg:text-xl font-bold leading-relaxed text-slate-100">
                        {activeTest.questions[currentQuestionIndex].prompt}
                      </h2>
                    </div>

                    <div className="space-y-2.5">
                      {activeTest.questions[currentQuestionIndex].options.map((opt: string, idx: number) => {
                        const qId = activeTest.questions[currentQuestionIndex].id;
                        const isSelected = selectedAnswers[qId] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [qId]: idx })}
                            className={`w-full text-left p-4 rounded-xl border text-xs lg:text-sm font-semibold transition-all ${
                              isSelected
                                ? 'bg-[#f5b82e]/15 border-[#f5b82e] text-[#f5b82e]'
                                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                      <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 rounded-xl bg-slate-800/60 disabled:opacity-40 text-xs font-bold text-slate-300 border border-slate-700/60"
                      >
                        Předchozí
                      </button>

                      {currentQuestionIndex < activeTest.questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                          className="px-5 py-2 rounded-xl bg-[#68baaa] hover:bg-[#52a393] text-slate-950 font-extrabold text-xs transition-colors"
                        >
                          Další otázka
                        </button>
                      ) : (
                        <button
                          onClick={submitTest}
                          className="px-5 py-2 rounded-xl bg-[#ef6453] hover:bg-[#d84e3d] text-white font-extrabold text-xs transition-transform active:scale-95 shadow-sm"
                        >
                          Vyhodnotit test
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* TEST RESULTS DISPLAY */
                  <div className={`p-6 lg:p-8 rounded-2xl ${cardClass} space-y-6`}>
                    <div className="text-center space-y-2">
                      <div className="inline-flex p-3 rounded-2xl bg-[#f5b82e]/10 text-[#f5b82e] border border-[#f5b82e]/20">
                        <Award className="w-10 h-10" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-100">Výsledky testu</h2>
                      <div className="text-5xl font-black text-[#f5b82e]">
                        {testResult?.percentage}%
                      </div>
                      <p className="text-slate-400 text-xs">
                        Získali jste <strong className="text-slate-200">{testResult?.score}</strong> z{' '}
                        <strong className="text-slate-200">{testResult?.totalQuestions}</strong> bodů.
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800/80">
                      <h3 className="font-bold text-sm text-slate-200">Přehled otázek:</h3>
                      {activeTest.questions.map((q, idx) => {
                        const userAns = selectedAnswers[q.id];
                        const isCorrect = userAns === q.correctOption;
                        return (
                          <div
                            key={q.id}
                            className={`p-4 rounded-xl border text-xs space-y-2 ${
                              isCorrect
                                ? 'border-[#68baaa]/40 bg-[#68baaa]/5'
                                : 'border-[#ef6453]/40 bg-[#ef6453]/5'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">
                                {idx + 1}. {q.prompt}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-[#68baaa]/20 text-[#68baaa]' : 'bg-[#ef6453]/20 text-[#ef6453]'}`}>
                                {isCorrect ? 'Správně' : 'Chyba'}
                              </span>
                            </div>
                            <p className="text-slate-400">
                              Vaše odpověď: <strong className="text-slate-200">{userAns !== undefined ? q.options[userAns] : 'Nezodpovězeno'}</strong>
                            </p>
                            {!isCorrect && (
                              <div className="p-3 rounded-lg bg-slate-950/80 space-y-1 border border-slate-800/80">
                                <span className="font-bold text-[#68baaa]">Správné řešení: {q.options[q.correctOption]}</span>
                                <p className="text-slate-400 leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => setActiveTest(null)}
                        className="px-6 py-2.5 rounded-xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-extrabold text-xs transition-transform active:scale-95 shadow-sm"
                      >
                        Zpět na přehled testů
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ERROR PRACTICE TAB */}
        {activeTab === 'errors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Procvičování chyb (Chybovník)</h2>
              <p className="text-xs text-slate-400">Otázky, ve kterých jsi v minulosti chyboval/a. Jakmile otázku zvládneš, vyřaď ji tlačítkem.</p>
            </div>

            {/* CATEGORY FILTER */}
            <div className="flex flex-wrap gap-2">
              {['vse', 'Pravopis', 'Literatura', 'Mluvnice', 'Textová návaznost'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setErrorCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    errorCategory === cat
                      ? 'bg-[#ef6453] text-white shadow-sm'
                      : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat === 'vse' ? 'Všechny chyby' : cat}
                </button>
              ))}
            </div>

            {!currentErrorQuestion ? (
              <div className={`p-10 text-center rounded-2xl ${cardClass} space-y-3`}>
                <CheckCircle className="w-12 h-12 text-[#68baaa] mx-auto" />
                <h3 className="font-bold text-lg text-slate-100">Žádné nevyřešené chyby!</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  Skvělá práce! V této kategorii nemáš žádné nevyřešené chyby. Vyzkoušej nový Cermat test.
                </p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-5">
                <div className={`p-6 lg:p-8 rounded-2xl ${cardClass} space-y-5`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#ef6453]/10 text-[#ef6453] border border-[#ef6453]/20">
                      {currentErrorQuestion.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {activeErrorIndex + 1} z {errorQuestions.length}
                    </span>
                  </div>

                  <h3 className="text-base lg:text-lg font-bold leading-relaxed text-slate-100">
                    {currentErrorQuestion.prompt}
                  </h3>

                  <div className="space-y-2.5">
                    {currentErrorQuestion.options.map((opt: string, idx: number) => {
                      const isCorrect = idx === currentErrorQuestion.correctOption;
                      const isSelected = errorSelectedAnswer === idx;

                      let btnStyle = 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300';
                      if (errorSelectedAnswer !== null) {
                        if (isCorrect) btnStyle = 'bg-[#68baaa]/20 border-[#68baaa] text-[#68baaa] font-bold';
                        else if (isSelected) btnStyle = 'bg-[#ef6453]/20 border-[#ef6453] text-[#ef6453] font-bold';
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
                    <div className="p-4 rounded-xl bg-slate-950/80 space-y-1 text-xs border border-slate-800/80">
                      <span className="font-bold text-[#f5b82e]">Vysvětlení:</span>
                      <p className="text-slate-400 leading-relaxed font-normal">
                        {currentErrorQuestion.explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => handleMasterErrorQuestion(currentErrorQuestion.id)}
                      className="px-4 py-2 rounded-xl bg-[#68baaa]/20 hover:bg-[#68baaa]/30 text-[#68baaa] border border-[#68baaa]/30 text-xs font-bold transition-colors"
                    >
                      Označit jako zvládnuté ✓
                    </button>

                    <button
                      onClick={() => {
                        setActiveErrorIndex((prev) => (prev + 1) % errorQuestions.length);
                        setErrorSelectedAnswer(null);
                        setErrorShowExplanation(false);
                      }}
                      className="px-5 py-2 rounded-xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-extrabold text-xs transition-colors"
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
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Maturitní četba & Rozbory</h2>
                <p className="text-xs text-slate-400">Vyber si svých 20 maturitních knih a procházej rozbory děl, děje a časoprostoru.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={bookSearchQuery}
                    onChange={(e) => setBookSearchQuery(e.target.value)}
                    placeholder="Hledat autora či knihu..."
                    className="pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-[#f5b82e] w-48 sm:w-64"
                  />
                </div>

                <span className="text-xs font-bold px-3 py-2 rounded-xl bg-[#f5b82e]/10 text-[#f5b82e] border border-[#f5b82e]/20">
                  Vybráno: {userBookIds.length} / 20
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700/60"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Tisk
                </button>
              </div>
            </div>

            {/* CATALOG GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBooks.map((book) => {
                const isSelected = userBookIds.includes(book.id);
                return (
                  <div
                    key={book.id}
                    className={`p-5 rounded-2xl ${cardClass} flex flex-col justify-between space-y-4`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                          {book.genre}
                        </span>
                        <button
                          onClick={() => toggleBookSelection(book.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isSelected ? 'bg-[#68baaa]/20 text-[#68baaa] border-[#68baaa]/40' : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:text-slate-200'
                          }`}
                          title={isSelected ? 'Odebrat ze seznamu' : 'Přidat do seznamu 20 knih'}
                        >
                          {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-100">{book.title}</h3>
                        <p className="text-xs text-[#f5b82e] font-semibold">{book.author}</p>
                      </div>

                      <p className="text-[11px] text-slate-400 font-normal">{book.period}</p>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setSelectedBookDetail(book);
                          setEditingNotes(userNotes[book.id] || '');
                        }}
                        className="w-full py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 font-bold text-xs transition-colors border border-slate-700/60"
                      >
                        Zobrazit podrobný rozbor
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BOOK DETAIL MODAL */}
            {selectedBookDetail && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div className={`max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 lg:p-8 rounded-2xl ${cardClass} space-y-5 relative shadow-2xl bg-slate-900 border border-slate-800`}>
                  <button
                    onClick={() => setSelectedBookDetail(null)}
                    className="absolute top-5 right-5 text-slate-400 hover:text-[#ef6453] p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div>
                    <span className="text-[10px] font-bold text-[#68baaa] uppercase tracking-wider">{selectedBookDetail.period}</span>
                    <h2 className="text-2xl font-bold mt-0.5 text-slate-100">{selectedBookDetail.title}</h2>
                    <p className="text-[#f5b82e] font-semibold text-sm">{selectedBookDetail.author}</p>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300 font-normal">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <strong className="text-slate-100 block mb-0.5 font-bold">Žánr & Druh:</strong>
                      {selectedBookDetail.genre}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <strong className="text-slate-100 block mb-0.5 font-bold">Časoprostor:</strong>
                      {selectedBookDetail.timeAndPlace}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <strong className="text-slate-100 block mb-0.5 font-bold">Téma & Motivy:</strong>
                      {selectedBookDetail.themeAndMotifs}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <strong className="text-slate-100 block mb-0.5 font-bold">Hlavní postavy:</strong>
                      {selectedBookDetail.characters}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <strong className="text-slate-100 block mb-0.5 font-bold">Stručný děj:</strong>
                      <p className="leading-relaxed">{selectedBookDetail.plotSummary}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <strong className="text-slate-100 block mb-0.5 font-bold">Jazyk & Styl:</strong>
                      {selectedBookDetail.languageAndStyle}
                    </div>

                    {user && (
                      <div className="pt-2">
                        <strong className="text-slate-100 block mb-1 font-bold">Moje poznámky k dílu:</strong>
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          placeholder="Zadejte vlastní stručné poznámky k maturitní otázce..."
                          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-[#f5b82e] text-slate-200"
                          rows={3}
                        />
                        <button
                          onClick={() => saveBookNotes(selectedBookDetail.id)}
                          className="mt-2 px-4 py-1.5 rounded-xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-bold text-xs"
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

        {/* RESOURCES & AUDIO TAB */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Zdroje četby & Audioknihy zdarma</h2>
              <p className="text-xs text-slate-400">Stahuj e-knihy v PDF/EPUB nebo přehrávej audio rozbory z Českého rozhlasu a Městské knihovny v Praze.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl ${cardClass} flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.type === 'audiobook' ? 'bg-[#f5b82e]/10 text-[#f5b82e] border border-[#f5b82e]/20' : 'bg-[#68baaa]/10 text-[#68baaa] border border-[#68baaa]/20'}`}>
                        {item.type === 'audiobook' ? '🎧 Audiokniha' : '📖 E-Kniha'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.format}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                      <p className="text-xs text-slate-400">Autor: <strong className="text-slate-200">{item.author}</strong></p>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-normal">{item.description}</p>
                    <span className="text-[11px] text-[#68baaa] font-medium block">Zdroj: {item.sourceName}</span>
                  </div>

                  <div className="pt-1">
                    {item.type === 'audiobook' && item.streamUrl ? (
                      <button
                        onClick={() =>
                          setActiveAudio({
                            title: item.title,
                            author: item.author,
                            streamUrl: item.streamUrl || '',
                            sourceName: item.sourceName
                          })
                        }
                        className="w-full py-2.5 rounded-xl bg-[#ef6453] hover:bg-[#d84e3d] text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Přehrát v aplikaci
                      </button>
                    ) : (
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Stáhnout e-knihu
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* AUDIO PLAYER BAR */}
      {activeAudio && (
        <AudioPlayer
          title={activeAudio.title}
          author={activeAudio.author}
          streamUrl={activeAudio.streamUrl}
          sourceName={activeAudio.sourceName}
          onClose={() => setActiveAudio(null)}
        />
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-sm w-full p-6 rounded-2xl ${cardClass} space-y-4 relative shadow-2xl bg-slate-900 border border-slate-800`}>
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#ef6453] p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-100">
                {authMode === 'login' ? 'Přihlášení do MaturYta' : 'Registrace nového účtu'}
              </h3>
              <p className="text-xs text-slate-400">
                Ukládej si testy, chybovník a vybranou četbu.
              </p>
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-[#ef6453]/10 border border-[#ef6453]/30 text-[#ef6453] text-xs font-semibold">
                {authError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Uživatelské jméno {authMode === 'login' && '/ E-mail'}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="JanNovak"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-[#f5b82e] text-slate-200"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@skola.cz"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-[#f5b82e] text-slate-200"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Heslo</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-[#f5b82e] text-slate-200"
                />
              </div>

              <button
                onClick={() => (authMode === 'login' ? handleLogin(false) : handleRegister())}
                className="w-full py-2.5 rounded-xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-extrabold text-xs transition-transform active:scale-95 shadow-sm"
              >
                {authMode === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
              </button>

              <button
                onClick={() => handleLogin(true)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-bold text-xs border border-slate-700/60 transition-colors"
              >
                Vyzkoušet bez přihlášení (Demo)
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs text-[#f5b82e] hover:underline font-bold"
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
