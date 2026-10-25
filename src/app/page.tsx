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
  Award
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
        username: 'Host / Student',
        email: 'host@maturyta.cz',
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
      setAuthError('Supabase není nakonfigurován. Použijte možnost "Vyzkoušet bez přihlášení (Host / Demo)".');
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
      setAuthError('Supabase není nakonfigurován. Použijte možnost "Vyzkoušet bez přihlášení (Host / Demo)".');
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
    ? 'bg-slate-950 text-slate-100'
    : 'bg-[#faf9f6] text-slate-900';

  const cardClass = darkMode
    ? 'bg-slate-900/90 border-2 border-slate-800 shadow-xl'
    : 'bg-white border-2 border-slate-200 shadow-lg';

  const currentErrorQuestion = errorQuestions[activeErrorIndex];

  return (
    <div className={`min-h-screen ${themeClass} flex flex-col font-sans transition-colors duration-200 pb-24`}>
      {/* TOP DECORATIVE PATTERN BAR */}
      <div className="h-3 w-full bg-gradient-to-r from-[#f5b82e] via-[#ef6453] to-[#68baaa]" />

      {/* HEADER NAVBAR */}
      <header className={`sticky top-0 z-40 border-b-2 ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-md px-4 lg:px-8 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f5b82e] text-slate-900 flex items-center justify-center font-black text-2xl shadow-lg shadow-[#f5b82e]/20 border-2 border-slate-900 transform -rotate-2">
              M
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#f5b82e] via-[#ef6453] to-[#68baaa]">
                MaturYta
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f5b82e]/20 text-[#f5b82e] border border-[#f5b82e]/30">
                Český Jazyk
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-800/40 p-1.5 rounded-2xl border-2 border-slate-800">
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all active:scale-95 ${
                    active
                      ? 'bg-[#f5b82e] text-slate-950 shadow-md shadow-[#f5b82e]/30 border border-slate-950'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* User & Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-2xl border-2 ${darkMode ? 'border-slate-800 hover:bg-slate-800 text-[#f5b82e]' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`}
              title="Přepnout tmavý/světlý režim"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-black text-[#f5b82e]">{user.username}</span>
                  <span className="text-xs text-slate-400">{user.isGuest ? 'Hostovací účet' : user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-2xl text-[#ef6453] hover:bg-[#ef6453]/10 border-2 border-[#ef6453]/30 transition-colors"
                  title="Odhlásit se"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#ef6453] hover:bg-[#d84e3d] text-white font-extrabold text-sm transition-transform active:scale-95 shadow-lg shadow-[#ef6453]/30 border-2 border-slate-900"
              >
                <User className="w-4 h-4" />
                Přihlásit se
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t-2 border-slate-800 px-2 py-2 flex justify-around">
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
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-bold ${
                active ? 'text-[#f5b82e]' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e293b] via-[#2b3c4f] to-[#3b5066] p-8 lg:p-12 text-white shadow-2xl border-4 border-[#f5b82e]/40">
              <div className="relative z-10 max-w-2xl space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f5b82e] text-slate-950 text-xs font-black shadow-md border-2 border-slate-900">
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  Maturita z ČJL hravě & barevně
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Příprava na Maturitu z Českého Jazyka
                </h1>
                <p className="text-slate-200 text-lg leading-relaxed font-medium">
                  Procvičuj originální CERMAT didaktické testy, odstraňuj své slabiny s chytrou opakovanou chybovostí a spravuj svůj kompletní maturitní seznam četby s rozbory a audioknihami zdarma.
                </p>
                <div className="flex flex-wrap gap-4 pt-3">
                  <button
                    onClick={() => setActiveTab('tests')}
                    className="px-6 py-4 rounded-2xl bg-[#f5b82e] text-slate-950 font-black hover:bg-[#e0a520] transition-transform active:scale-95 flex items-center gap-2 shadow-xl border-2 border-slate-950 text-base"
                  >
                    <GraduationCap className="w-6 h-6 text-slate-950" />
                    Spustit Cermat Test
                  </button>
                  <button
                    onClick={() => setActiveTab('books')}
                    className="px-6 py-4 rounded-2xl bg-[#68baaa] text-slate-950 font-black hover:bg-[#52a393] transition-transform active:scale-95 flex items-center gap-2 shadow-xl border-2 border-slate-950 text-base"
                  >
                    <BookOpen className="w-6 h-6 text-slate-950" />
                    Moje maturita četba ({userBookIds.length}/20)
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK STATS & FEATURES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-8 rounded-3xl border-2 ${cardClass} space-y-4 hover:border-[#f5b82e] transition-colors`}>
                <div className="w-14 h-14 rounded-2xl bg-[#f5b82e] text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg border-2 border-slate-900">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-2xl">CERMAT Testy</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  Didaktické testy s možností reálného časovače (85 minut) nebo tréninkového režimu bez času.
                </p>
                <button
                  onClick={() => setActiveTab('tests')}
                  className="text-sm font-extrabold text-[#f5b82e] hover:text-[#e0a520] flex items-center gap-1 pt-2"
                >
                  Přejít na testy <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className={`p-8 rounded-3xl border-2 ${cardClass} space-y-4 hover:border-[#ef6453] transition-colors`}>
                <div className="w-14 h-14 rounded-2xl bg-[#ef6453] text-white flex items-center justify-center font-black text-2xl shadow-lg border-2 border-slate-900">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-2xl">Procvičování chyb</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  Špatně zodpovězené otázky se ukládají do osobní fronty a vrací se, dokud je plně nezvládneš.
                </p>
                <button
                  onClick={() => setActiveTab('errors')}
                  className="text-sm font-extrabold text-[#ef6453] hover:text-[#d84e3d] flex items-center gap-1 pt-2"
                >
                  Procvičit chyby ({errorQuestions.length}) <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className={`p-8 rounded-3xl border-2 ${cardClass} space-y-4 hover:border-[#68baaa] transition-colors`}>
                <div className="w-14 h-14 rounded-2xl bg-[#68baaa] text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg border-2 border-slate-900">
                  <Headphones className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-2xl">Audioknihy zdarma</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  Přístup ke knižním rozborům, e-knihám ke stažení zdarma (MLP, OceansofPDF) a integrovanému přehrávači.
                </p>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="text-sm font-extrabold text-[#68baaa] hover:text-[#52a393] flex items-center gap-1 pt-2"
                >
                  Zdroje zdarma <ChevronRight className="w-4 h-4" />
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
                  <h2 className="text-3xl font-black tracking-tight">DIDAKTICKÉ TESTY CERMAT</h2>
                  <p className="text-slate-300 font-medium">Vyber si test k procvičení. Můžeš zvolit oficiální ostrý režim s časem nebo neomezený trénink.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tests.map((test) => (
                    <div key={test.id} className={`p-8 rounded-3xl border-2 ${cardClass} space-y-5 hover:border-[#f5b82e] transition-colors`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-[#f5b82e] text-slate-950 border border-slate-900">
                            {test.season} {test.year}
                          </span>
                          <h3 className="text-2xl font-black mt-3">{test.title}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 font-mono font-bold">
                          <Clock className="w-4 h-4 text-[#f5b82e]" />
                          {test.timeLimitMinutes} minut
                        </div>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        Obsahuje {test.questions.length} kompletních otázek zaměřených na Pravopis, Literární historii, Mluvnici a Textovou návaznost s podrobným vysvětlením.
                      </p>

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                        <button
                          onClick={() => startTest(test, 'timed')}
                          className="w-full sm:flex-1 py-3.5 rounded-2xl bg-[#ef6453] hover:bg-[#d84e3d] text-white font-extrabold text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 border-2 border-slate-900 shadow-md"
                        >
                          <Clock className="w-4 h-4" />
                          Ostrý časovaný test (85 min)
                        </button>
                        <button
                          onClick={() => startTest(test, 'untimed')}
                          className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-sm transition-colors border-2 border-slate-700"
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
              <div className="max-w-4xl mx-auto space-y-6">
                <div className={`p-6 rounded-3xl border-2 ${cardClass} flex items-center justify-between`}>
                  <div>
                    <h3 className="font-extrabold text-xl">{activeTest.title}</h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Otázka {currentQuestionIndex + 1} z {activeTest.questions.length}
                    </p>
                  </div>

                  {testMode === 'timed' && !isTestSubmitted && (
                    <div className="flex items-center gap-2 font-mono font-black text-lg px-4 py-2 rounded-2xl bg-[#f5b82e] text-slate-950 border-2 border-slate-900 shadow-md">
                      <Clock className="w-5 h-5 animate-pulse" />
                      {formatSeconds(timeLeft)}
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTest(null)}
                    className="text-xs text-[#ef6453] hover:underline font-extrabold"
                  >
                    Ukončit test
                  </button>
                </div>

                {!isTestSubmitted ? (
                  <div className={`p-8 rounded-3xl border-2 ${cardClass} space-y-6`}>
                    {/* QUESTION DISPLAY */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-[#68baaa] text-slate-950 border border-slate-900">
                          {activeTest.questions[currentQuestionIndex].category}
                        </span>
                      </div>
                      <h2 className="text-2xl font-extrabold leading-relaxed">
                        {activeTest.questions[currentQuestionIndex].prompt}
                      </h2>
                    </div>

                    {/* OPTIONS */}
                    <div className="space-y-3">
                      {activeTest.questions[currentQuestionIndex].options.map((opt: string, idx: number) => {
                        const qId = activeTest.questions[currentQuestionIndex].id;
                        const isSelected = selectedAnswers[qId] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [qId]: idx })}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all text-base font-bold ${
                              isSelected
                                ? 'bg-[#f5b82e] text-slate-950 border-slate-950 shadow-lg scale-[1.01]'
                                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-200'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* NAVIGATION BUTTONS */}
                    <div className="flex justify-between items-center pt-6 border-t-2 border-slate-800">
                      <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-5 py-3 rounded-2xl bg-slate-800 disabled:opacity-40 text-sm font-extrabold text-slate-300 border-2 border-slate-700"
                      >
                        Předchozí
                      </button>

                      {currentQuestionIndex < activeTest.questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                          className="px-7 py-3 rounded-2xl bg-[#68baaa] hover:bg-[#52a393] text-slate-950 font-black text-sm border-2 border-slate-900 shadow-md"
                        >
                          Další otázka
                        </button>
                      ) : (
                        <button
                          onClick={submitTest}
                          className="px-7 py-3 rounded-2xl bg-[#ef6453] hover:bg-[#d84e3d] text-white font-black text-sm border-2 border-slate-900 shadow-lg shadow-[#ef6453]/30"
                        >
                          Dokončit & Vyhodnotit
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* TEST RESULTS DISPLAY */
                  <div className={`p-8 rounded-3xl border-2 ${cardClass} space-y-8`}>
                    <div className="text-center space-y-3">
                      <div className="inline-flex p-5 rounded-3xl bg-[#f5b82e] text-slate-950 border-2 border-slate-900 shadow-xl">
                        <Award className="w-14 h-14" />
                      </div>
                      <h2 className="text-3xl font-black">Výsledky Didaktického Testu</h2>
                      <div className="text-6xl font-black text-[#f5b82e]">
                        {testResult?.percentage}%
                      </div>
                      <p className="text-slate-300 font-medium">
                        Získali jste <strong className="text-white">{testResult?.score}</strong> z{' '}
                        <strong className="text-white">{testResult?.totalQuestions}</strong> možných bodů.
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t-2 border-slate-800">
                      <h3 className="font-extrabold text-xl">Podrobný přehled odpovědí:</h3>
                      {activeTest.questions.map((q, idx) => {
                        const userAns = selectedAnswers[q.id];
                        const isCorrect = userAns === q.correctOption;
                        return (
                          <div
                            key={q.id}
                            className={`p-5 rounded-2xl border-2 space-y-3 ${
                              isCorrect
                                ? 'border-[#68baaa] bg-[#68baaa]/10'
                                : 'border-[#ef6453] bg-[#ef6453]/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-base">
                                {idx + 1}. {q.prompt}
                              </span>
                              <span className={`text-xs font-black px-3 py-1 rounded-full border ${isCorrect ? 'bg-[#68baaa] text-slate-950 border-slate-900' : 'bg-[#ef6453] text-white border-slate-900'}`}>
                                {isCorrect ? 'Správně' : 'Chyba'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">
                              Vaše odpověď: <strong className="text-slate-100">{userAns !== undefined ? q.options[userAns] : 'Nezodpovězeno'}</strong>
                            </p>
                            {!isCorrect && (
                              <div className="p-4 rounded-xl bg-slate-900/90 text-xs space-y-1.5 border border-slate-800">
                                <span className="font-bold text-[#68baaa]">Správná možnost: {q.options[q.correctOption]}</span>
                                <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setActiveTest(null)}
                        className="px-8 py-4 rounded-2xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-black text-base border-2 border-slate-900 shadow-xl"
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
              <h2 className="text-3xl font-black tracking-tight">PROCVIČOVÁNÍ CHYB (WEAKNESS PRACTICE)</h2>
              <p className="text-slate-300 font-medium">Zde se ukládají všechny otázky, ve kterých jste v testech udělali chybu. Procvičujte je opakovaně, dokud je nezvládnete.</p>
            </div>

            {/* CATEGORY FILTER */}
            <div className="flex flex-wrap gap-2">
              {['vse', 'Pravopis', 'Literatura', 'Mluvnice', 'Textová návaznost'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setErrorCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                    errorCategory === cat
                      ? 'bg-[#ef6453] text-white border-slate-900 shadow-md'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {cat === 'vse' ? 'Všechny chyby' : cat}
                </button>
              ))}
            </div>

            {!currentErrorQuestion ? (
              <div className={`p-12 text-center rounded-3xl border-2 ${cardClass} space-y-4`}>
                <CheckCircle className="w-16 h-16 text-[#68baaa] mx-auto" />
                <h3 className="font-extrabold text-2xl">Žádné nevyřešené chyby!</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                  Skvělá práce! V této kategorii nemáte žádné špatně zodpovězené otázky. Vyzkoušejte nový Cermat didaktický test.
                </p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className={`p-8 rounded-3xl border-2 ${cardClass} space-y-6`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#ef6453] text-white border border-slate-900">
                      {currentErrorQuestion.category}
                    </span>
                    <span className="text-xs text-slate-300 font-bold font-mono">
                      Chyba {activeErrorIndex + 1} z {errorQuestions.length}
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold leading-relaxed">
                    {currentErrorQuestion.prompt}
                  </h3>

                  <div className="space-y-3">
                    {currentErrorQuestion.options.map((opt: string, idx: number) => {
                      const isCorrect = idx === currentErrorQuestion.correctOption;
                      const isSelected = errorSelectedAnswer === idx;

                      let btnStyle = 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-200';
                      if (errorSelectedAnswer !== null) {
                        if (isCorrect) btnStyle = 'bg-[#68baaa] text-slate-950 border-slate-950 shadow-md font-black';
                        else if (isSelected) btnStyle = 'bg-[#ef6453] text-white border-slate-950 shadow-md font-black';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setErrorSelectedAnswer(idx);
                            setErrorShowExplanation(true);
                          }}
                          className={`w-full text-left p-5 rounded-2xl border-2 transition-all text-base font-bold ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {errorShowExplanation && (
                    <div className="p-5 rounded-2xl bg-slate-900 space-y-2 text-xs border-2 border-slate-700">
                      <span className="font-extrabold text-[#f5b82e]">Vysvětlení správného řešení:</span>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {currentErrorQuestion.explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t-2 border-slate-800">
                    <button
                      onClick={() => handleMasterErrorQuestion(currentErrorQuestion.id)}
                      className="px-5 py-3 rounded-2xl bg-[#68baaa] text-slate-950 border-2 border-slate-900 hover:bg-[#52a393] text-xs font-black transition-colors shadow-md"
                    >
                      Označit jako zvládnuté ✓
                    </button>

                    <button
                      onClick={() => {
                        setActiveErrorIndex((prev) => (prev + 1) % errorQuestions.length);
                        setErrorSelectedAnswer(null);
                        setErrorShowExplanation(false);
                      }}
                      className="px-7 py-3 rounded-2xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-black text-sm border-2 border-slate-900 shadow-md"
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
                <h2 className="text-3xl font-black tracking-tight">MATURITNÍ ČETBA & ROZBORY</h2>
                <p className="text-slate-300 font-medium">Sestav si svých 20 maturitních děl. Procházej podrobné rozbory autorů, časoprostoru a struktury.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black px-4 py-2 rounded-2xl bg-[#f5b82e] text-slate-950 border-2 border-slate-900 shadow-md">
                  Vybráno: {userBookIds.length} / 20 knih
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-extrabold flex items-center gap-2 border-2 border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  Vytisknout seznam
                </button>
              </div>
            </div>

            {/* CATALOG GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogBooks.map((book) => {
                const isSelected = userBookIds.includes(book.id);
                return (
                  <div
                    key={book.id}
                    className={`p-7 rounded-3xl border-2 ${cardClass} flex flex-col justify-between space-y-5 hover:border-[#f5b82e] transition-all`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {book.genre}
                        </span>
                        <button
                          onClick={() => toggleBookSelection(book.id)}
                          className={`p-2 rounded-xl border-2 transition-colors ${
                            isSelected ? 'bg-[#68baaa] text-slate-950 border-slate-950' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                          title={isSelected ? 'Odebrat ze seznamu' : 'Přidat do seznamu (20 knih)'}
                        >
                          {isSelected ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </div>

                      <h3 className="text-2xl font-black">{book.title}</h3>
                      <p className="text-sm text-[#f5b82e] font-extrabold">{book.author}</p>
                      <p className="text-xs text-slate-400 font-medium">{book.period}</p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedBookDetail(book);
                          setEditingNotes(userNotes[book.id] || '');
                        }}
                        className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-[#f5b82e] font-black text-xs transition-colors border-2 border-slate-700"
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
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl border-4 border-[#f5b82e] ${cardClass} space-y-6 relative shadow-2xl`}>
                  <button
                    onClick={() => setSelectedBookDetail(null)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-[#ef6453] font-black text-xl"
                  >
                    ✕
                  </button>

                  <div>
                    <span className="text-xs font-black text-[#68baaa] uppercase tracking-wider">{selectedBookDetail.period}</span>
                    <h2 className="text-3xl font-black mt-1">{selectedBookDetail.title}</h2>
                    <p className="text-[#f5b82e] font-extrabold text-lg">{selectedBookDetail.author}</p>
                  </div>

                  <div className="space-y-4 text-sm text-slate-200 font-medium">
                    <div>
                      <strong className="text-white block mb-1 font-black">Žánr & Druh:</strong>
                      <p className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">{selectedBookDetail.genre}</p>
                    </div>

                    <div>
                      <strong className="text-white block mb-1 font-black">Časoprostor:</strong>
                      <p className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">{selectedBookDetail.timeAndPlace}</p>
                    </div>

                    <div>
                      <strong className="text-white block mb-1 font-black">Téma & Motivy:</strong>
                      <p className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">{selectedBookDetail.themeAndMotifs}</p>
                    </div>

                    <div>
                      <strong className="text-white block mb-1 font-black">Hlavní postavy:</strong>
                      <p className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">{selectedBookDetail.characters}</p>
                    </div>

                    <div>
                      <strong className="text-white block mb-1 font-black">Stručný děj:</strong>
                      <p className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 leading-relaxed">{selectedBookDetail.plotSummary}</p>
                    </div>

                    <div>
                      <strong className="text-white block mb-1 font-black">Jazyk & Styl:</strong>
                      <p className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">{selectedBookDetail.languageAndStyle}</p>
                    </div>

                    {user && (
                      <div>
                        <strong className="text-white block mb-1 font-black">Moje osobní poznámky k rozboru:</strong>
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          placeholder="Přidejte si vlastní poznámky pro učitele nebo k maturitní otázce..."
                          className="w-full p-4 rounded-2xl bg-slate-950 border-2 border-slate-700 text-sm focus:outline-none focus:border-[#f5b82e]"
                          rows={3}
                        />
                        <button
                          onClick={() => saveBookNotes(selectedBookDetail.id)}
                          className="mt-2 px-5 py-2 rounded-xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-black text-xs border border-slate-900 shadow-md"
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
              <h2 className="text-3xl font-black tracking-tight">ZDROJE ČETBY & AUDIOKNIHY ZDARMA</h2>
              <p className="text-slate-300 font-medium">Přístup k e-knihám a nahrávkám zdarma z Městské knihovny v Praze (mlp.cz), OceansofPDF a Českého rozhlasu.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((item) => (
                <div
                  key={item.id}
                  className={`p-7 rounded-3xl border-2 ${cardClass} flex flex-col justify-between space-y-5`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-black px-3 py-1 rounded-full border border-slate-900 ${item.type === 'audiobook' ? 'bg-[#f5b82e] text-slate-950' : 'bg-[#68baaa] text-slate-950'}`}>
                        {item.type === 'audiobook' ? '🎧 Audiokniha' : '📖 E-Kniha'}
                      </span>
                      <span className="text-xs text-slate-300 font-mono font-bold">{item.format}</span>
                    </div>

                    <h3 className="text-2xl font-black">{item.title}</h3>
                    <p className="text-xs font-extrabold text-slate-300">Autor: <strong className="text-white">{item.author}</strong></p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{item.description}</p>
                    <span className="text-xs text-[#68baaa] font-extrabold block">Zdroj: {item.sourceName}</span>
                  </div>

                  <div className="pt-2">
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
                        className="w-full py-3.5 rounded-2xl bg-[#ef6453] hover:bg-[#d84e3d] text-white font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md border-2 border-slate-900"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Přehrát audioknihu v aplikaci
                      </button>
                    ) : (
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3.5 rounded-2xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md border-2 border-slate-900"
                      >
                        <Download className="w-4 h-4" />
                        Stáhnout e-knihu zdarma
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* AUDIO PLAYER */}
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-8 rounded-3xl border-4 border-[#f5b82e] ${cardClass} space-y-6 relative shadow-2xl`}>
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-[#ef6453] font-black text-xl"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black">
                {authMode === 'login' ? 'Přihlášení do MaturYta' : 'Registrace nového účtu'}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Ukládejte si výsledky testů, procvičování chyb a maturitní četbu.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-[#ef6453]/20 border-2 border-[#ef6453] text-[#ef6453] text-xs font-bold">
                {authError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Uživatelské jméno {authMode === 'login' && '/ E-mail'}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="např. JanNovak"
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border-2 border-slate-700 text-sm focus:outline-none focus:border-[#f5b82e]"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@skola.cz"
                    className="w-full p-3.5 rounded-2xl bg-slate-950 border-2 border-slate-700 text-sm focus:outline-none focus:border-[#f5b82e]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Heslo</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border-2 border-slate-700 text-sm focus:outline-none focus:border-[#f5b82e]"
                />
              </div>

              <button
                onClick={() => (authMode === 'login' ? handleLogin(false) : handleRegister())}
                className="w-full py-3.5 rounded-2xl bg-[#f5b82e] hover:bg-[#e0a520] text-slate-950 font-black text-sm border-2 border-slate-900 shadow-md transition-transform active:scale-95"
              >
                {authMode === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
              </button>

              <button
                onClick={() => handleLogin(true)}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs border-2 border-slate-700 transition-colors"
              >
                Vyzkoušet bez přihlášení (Host / Demo)
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs text-[#f5b82e] hover:underline font-extrabold"
              >
                {authMode === 'login' ? 'Nemáte ještě účet? Zaregistrujte se' : 'Již máte účet? Přihlaste se'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
