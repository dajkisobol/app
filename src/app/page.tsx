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

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setCatalogBooks(data.catalog || []);
      setUserBookIds(data.userBookIds || []);
      setUserNotes(data.userNotes || {});
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchResources = useCallback(() => {
    const res: ResourceItem[] = [
      {
        id: 'res-rur-ebook',
        title: 'R.U.R. (E-kniha zdarma)',
        author: 'Karel Čapek',
        type: 'ebook',
        format: 'EPUB / PDF',
        sourceName: 'Městská knihovna v Praze (mlp.cz)',
        downloadUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/r.u.r./',
        description: 'Oficiální e-kniha vydaná Městskou knihovnou v Praze zdarma ke stažení pro maturanty.',
        coverColor: 'from-blue-600 to-indigo-800'
      },
      {
        id: 'res-maj-ebook',
        title: 'Máj (E-kniha zdarma)',
        author: 'Karel Hynek Mácha',
        type: 'ebook',
        format: 'EPUB / PDF',
        sourceName: 'Městská knihovna v Praze (mlp.cz)',
        downloadUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/maj/',
        description: 'Básnické vrcholné dílo českého romantismu k okamžitému stažení.',
        coverColor: 'from-purple-600 to-pink-700'
      },
      {
        id: 'res-1984-ocean',
        title: '1984 (Světová literatura)',
        author: 'George Orwell',
        type: 'ebook',
        format: 'PDF / EPUB',
        sourceName: 'OceansofPDF',
        downloadUrl: 'https://oceansofpdf.com/authors/george-orwell/pdf-epub-1984-download/',
        description: 'Bezplatný přístup k digitálnímu vydání kultovního dystopického románu.',
        coverColor: 'from-amber-600 to-red-800'
      },
      {
        id: 'res-rur-audio',
        title: 'R.U.R. Rozhlasová hra & Audiokniha',
        author: 'Karel Čapek',
        type: 'audiobook',
        format: 'MP3 Audio Stream',
        sourceName: 'Český rozhlas / MůjRozhlas',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        description: 'Kultovní rozhlasové zpracování s výborným obsazením ČRo Vltava.',
        coverColor: 'from-emerald-600 to-teal-800'
      },
      {
        id: 'res-maj-audio',
        title: 'Máj - Umělecký přednes',
        author: 'Karel Hynek Mácha',
        type: 'audiobook',
        format: 'MP3 Audio Stream',
        sourceName: 'Český rozhlas Vltava',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        description: 'Kompletní recitace a hudební doprovod v podání předních českých herců.',
        coverColor: 'from-violet-600 to-purple-900'
      },
      {
        id: 'res-kytice-audio',
        title: 'Kytice - Vybrané balady',
        author: 'Karel Jaromír Erben',
        type: 'audiobook',
        format: 'MP3 Audio Stream',
        sourceName: 'Knihovny.cz / MůjRozhlas',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        description: 'Dramatizace vybraných balad vhodná k poslechu při studiu.',
        coverColor: 'from-cyan-600 to-blue-800'
      }
    ];
    setResources(res);
  }, []);

  const fetchTests = useCallback(() => {
    const data: DidacticTest[] = [
      {
        id: 'cermat-2023-jaro',
        title: 'Didaktický test ČJL - Jaro 2023',
        year: '2023',
        season: 'Jaro',
        timeLimitMinutes: 85,
        questions: [
          {
            id: 'c2023j-1',
            category: 'Pravopis',
            prompt: 'Ve které z následujících větných dvojic jsou OBA pravopisy správné?',
            options: [
              'A) Byli jsme překvapeni výjimkami v pravidlech. / Na stěně visely starožitné hodiny.',
              'B) Zhlédl se v zrcadle s úsměvem. / Shlédli jsme nový film v kině.',
              'C) Běžel vústríc svému osudu. / Připravil vinný střik.',
              'D) Děti se radovali z prázdnin. / Psi hlasitě štěkali na dvoře.'
            ],
            correctOption: 0,
            explanation: 'Slovo "výjimka" se píše s dlouhým "ý" a krátkým "i". "Visely" má příčestí minulého času podle podmětu "hodiny" (ženský rod, Měkké i).'
          },
          {
            id: 'c2023j-2',
            category: 'Literatura',
            prompt: 'Která z následujících charakteristik nejlépe odpovídá dílu "RUR" od Karla Čapka?',
            options: [
              'A) Románová kronika sledování života na české vesnici v 19. století.',
              'B) Vědeckofantastické drama varující před zneužitím techniky a umělé inteligence, ve kterém poprvé zaznělo slovo "robot".',
              'C) Lyricko-epická báseň s tématem nešťastné lásky a tragické smrti mladého zbojníka.',
              'D) Historický román popisující období vlády Karla IV.'
            ],
            correctOption: 1,
            explanation: 'R.U.R. je utopické/sci-fi drama Karla Čapka z roku 1920, kde autor poprvé použil slovo "robot".'
          }
        ]
      }
    ];
    setTests(data);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      await fetchUser();
      if (isMounted) {
        fetchBooks();
        fetchResources();
        fetchTests();
      }
    };
    loadAll();
    return () => {
      isMounted = false;
    };
  }, [fetchUser, fetchBooks, fetchResources, fetchTests]);

  // Load Errors
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'errors' && user) {
      fetch(`/api/tests/results?category=${errorCategory}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            setErrorQuestions(data.questions || []);
            setActiveErrorIndex(0);
            setErrorSelectedAnswer(null);
            setErrorShowExplanation(false);
          }
        })
        .catch(console.error);
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
      try {
        await fetch('/api/tests/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId: activeTest.id,
            testTitle: activeTest.title,
            score,
            totalQuestions,
            timeSpentSeconds,
            missedQuestions
          })
        });
      } catch (e) {
        console.error(e);
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
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username, password, isGuest })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Chyba přihlášení.');
        return;
      }
      setUser(data.user);
      setShowAuthModal(false);
      fetchBooks();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setAuthError('Chyba přihlášení: ' + msg);
    }
  };

  const handleRegister = async () => {
    setAuthError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Chyba při registraci.');
        return;
      }
      setUser(data.user);
      setShowAuthModal(false);
      fetchBooks();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setAuthError('Chyba při registraci: ' + msg);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'POST' });
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
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, action: 'toggle' })
      });
      const data = await res.json();
      if (data.added) {
        setUserBookIds([...userBookIds, bookId]);
      } else {
        setUserBookIds(userBookIds.filter((id) => id !== bookId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveBookNotes = async (bookId: string) => {
    if (!user) return;
    try {
      await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, action: 'update_notes', notes: editingNotes })
      });
      setUserNotes({ ...userNotes, [bookId]: editingNotes });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMasterErrorQuestion = async (qId: string) => {
    if (!user) return;
    try {
      await fetch('/api/tests/results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: qId, mastered: true })
      });
      setErrorQuestions(errorQuestions.filter((q) => q.id !== qId));
      setErrorSelectedAnswer(null);
      setErrorShowExplanation(false);
    } catch (e) {
      console.error(e);
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const themeClass = darkMode
    ? 'bg-slate-950 text-slate-100'
    : 'bg-slate-50 text-slate-900';

  const cardClass = darkMode
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className={`min-h-screen ${themeClass} flex flex-col font-sans transition-colors duration-200 pb-24`}>
      {/* HEADER NAVBAR */}
      <header className={`sticky top-0 z-40 border-b ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md px-4 lg:px-8 py-3.5`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              M
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                MaturYta
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium">
                Český Jazyk
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/30 p-1 rounded-xl border border-slate-800">
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
              className={`p-2 rounded-xl border ${darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`}
              title="Přepnout tmavý/světlý režim"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-indigo-400">{user.username}</span>
                  <span className="text-xs text-slate-400">{user.isGuest ? 'Hostovací účet' : user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                  title="Odhlásit se"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-transform active:scale-95 shadow-md shadow-indigo-600/30"
              >
                <User className="w-4 h-4" />
                Přihlásit se
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-2 py-2 flex justify-around">
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
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium ${
                active ? 'text-indigo-400' : 'text-slate-400'
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-8 lg:p-12 text-white shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  Maturita z ČJL hravě a bez stresu
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Příprava na Maturitu z Českého Jazyka
                </h1>
                <p className="text-indigo-200 text-lg">
                  Procvičuj originální CERMAT didaktické testy, odstraňuj své slabiny s chytrou opakovanou chybovostí a spravuj svůj kompletní maturitní seznam četby s rozbory a audioknihami zdarma.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('tests')}
                    className="px-6 py-3.5 rounded-xl bg-white text-indigo-950 font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    Spustit Cermat Test
                  </button>
                  <button
                    onClick={() => setActiveTab('books')}
                    className="px-6 py-3.5 rounded-xl bg-indigo-700/50 hover:bg-indigo-700/80 text-white font-semibold transition-all border border-indigo-500/30 flex items-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Moje maturita četba ({userBookIds.length}/20)
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK STATS & FEATURES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border ${cardClass} space-y-3`}>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl">CERMAT Testy</h3>
                <p className="text-sm text-slate-400">
                  Didaktické testy s možností reálného časovače (85 minut) nebo tréninkového režimu bez času.
                </p>
                <button
                  onClick={() => setActiveTab('tests')}
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Přejít na testy <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className={`p-6 rounded-2xl border ${cardClass} space-y-3`}>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl">Chytré procvičování chyb</h3>
                <p className="text-sm text-slate-400">
                  Špatně zodpovězené otázky se ukladají do tvojí osobní fronty a vrací se, dokud je plně nezvládneš.
                </p>
                <button
                  onClick={() => setActiveTab('errors')}
                  className="text-sm font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  Procvičit chyby ({errorQuestions.length}) <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className={`p-6 rounded-2xl border ${cardClass} space-y-3`}>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl">E-knihy & Audioknihy zdarma</h3>
                <p className="text-sm text-slate-400">
                  Přístup ke knižním rozborům, e-knihám ke stažení zdarma (MLP, OceansofPDF) a integrovanému přehrávači.
                </p>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
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
                  <p className="text-slate-400">Vyber si test k procvičení. Můžeš zvolit oficiální ostrý režim s časem nebo neomezený trénink.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tests.map((test) => (
                    <div key={test.id} className={`p-6 rounded-2xl border ${cardClass} space-y-4 hover:border-indigo-500/50 transition-colors`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400">
                            {test.season} {test.year}
                          </span>
                          <h3 className="text-xl font-bold mt-2">{test.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          {test.timeLimitMinutes} minut
                        </div>
                      </div>

                      <p className="text-sm text-slate-400">
                        Obsahuje {test.questions.length} kompletních otázek zaměřených na Pravopis, Literární historii, Mluvnici a Textovou návaznost s podrobným vysvětlením.
                      </p>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={() => startTest(test, 'timed')}
                          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          Ostrý časovaný test (85 min)
                        </button>
                        <button
                          onClick={() => startTest(test, 'untimed')}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors"
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
                <div className={`p-6 rounded-2xl border ${cardClass} flex items-center justify-between`}>
                  <div>
                    <h3 className="font-extrabold text-lg">{activeTest.title}</h3>
                    <p className="text-xs text-slate-400">
                      Otázka {currentQuestionIndex + 1} z {activeTest.questions.length}
                    </p>
                  </div>

                  {testMode === 'timed' && !isTestSubmitted && (
                    <div className="flex items-center gap-2 font-mono font-bold text-lg px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Clock className="w-5 h-5 animate-pulse" />
                      {formatSeconds(timeLeft)}
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTest(null)}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    Ukončit test
                  </button>
                </div>

                {!isTestSubmitted ? (
                  <div className={`p-8 rounded-2xl border ${cardClass} space-y-6`}>
                    {/* QUESTION DISPLAY */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                          {activeTest.questions[currentQuestionIndex].category}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold leading-relaxed">
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
                            className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium ${
                              isSelected
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30'
                                : `${darkMode ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* NAVIGATION BUTTONS */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                      <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-40 text-sm font-semibold text-slate-300"
                      >
                        Předchozí
                      </button>

                      {currentQuestionIndex < activeTest.questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                          className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm"
                        >
                          Další otázka
                        </button>
                      ) : (
                        <button
                          onClick={submitTest}
                          className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30"
                        >
                          Dokončit & Vyhodnotit
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* TEST RESULTS DISPLAY */
                  <div className={`p-8 rounded-2xl border ${cardClass} space-y-8`}>
                    <div className="text-center space-y-3">
                      <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400">
                        <Award className="w-12 h-12" />
                      </div>
                      <h2 className="text-3xl font-black">Výsledky Didaktického Testu</h2>
                      <div className="text-5xl font-black text-indigo-400">
                        {testResult?.percentage}%
                      </div>
                      <p className="text-slate-400">
                        Získali jste <strong className="text-white">{testResult?.score}</strong> z{' '}
                        <strong className="text-white">{testResult?.totalQuestions}</strong> možných bodů.
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <h3 className="font-bold text-lg">Podrobný přehled odpovědí:</h3>
                      {activeTest.questions.map((q, idx) => {
                        const userAns = selectedAnswers[q.id];
                        const isCorrect = userAns === q.correctOption;
                        return (
                          <div
                            key={q.id}
                            className={`p-4 rounded-xl border space-y-2 ${
                              isCorrect
                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                : 'border-rose-500/30 bg-rose-500/5'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm">
                                {idx + 1}. {q.prompt}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {isCorrect ? 'Správně' : 'Chyba'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Vaše odpověď: <strong className="text-slate-200">{userAns !== undefined ? q.options[userAns] : 'Nezodpovězeno'}</strong>
                            </p>
                            {!isCorrect && (
                              <div className="p-3 rounded-lg bg-slate-900/60 text-xs space-y-1 mt-2">
                                <span className="font-semibold text-emerald-400">Správná možnost: {q.options[q.correctOption]}</span>
                                <p className="text-slate-300">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setActiveTest(null)}
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm"
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
              <p className="text-slate-400">Zde se ukládají všechny otázky, ve kterých jste v testech udělali chybu. Procvičujte je opakovaně, dokud je nezvládnete.</p>
            </div>

            {/* CATEGORY FILTER */}
            <div className="flex flex-wrap gap-2">
              {['vse', 'Pravopis', 'Literatura', 'Mluvnice', 'Textová návaznost'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setErrorCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    errorCategory === cat
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {cat === 'vse' ? 'Všechny chyby' : cat}
                </button>
              ))}
            </div>

            {errorQuestions.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border ${cardClass} space-y-3`}>
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-xl">Žádné nevyřešené chyby!</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Skvělá práce! V této kategorii nemáte žádné špatně zodpovězené otázky. Vyzkoušejte nový Cermat didaktický test.
                </p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className={`p-8 rounded-2xl border ${cardClass} space-y-6`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400">
                      {errorQuestions[activeErrorIndex]?.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Chyba {activeErrorIndex + 1} z {errorQuestions.length}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold leading-relaxed">
                    {errorQuestions[activeErrorIndex]?.prompt}
                  </h3>

                  <div className="space-y-3">
                    {errorQuestions[activeErrorIndex]?.options.map((opt: string, idx: number) => {
                      const isCorrect = idx === errorQuestions[activeErrorIndex].correctOption;
                      const isSelected = errorSelectedAnswer === idx;

                      let btnStyle = `${darkMode ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200'}`;
                      if (errorSelectedAnswer !== null) {
                        if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                        else if (isSelected) btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setErrorSelectedAnswer(idx);
                            setErrorShowExplanation(true);
                          }}
                          className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {errorShowExplanation && (
                    <div className="p-4 rounded-xl bg-slate-800/80 space-y-2 text-xs border border-slate-700">
                      <span className="font-bold text-indigo-400">Vysvětlení správného řešení:</span>
                      <p className="text-slate-300 leading-relaxed">
                        {errorQuestions[activeErrorIndex]?.explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleMasterErrorQuestion(errorQuestions[activeErrorIndex].id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-bold transition-colors"
                    >
                      Označit jako zvládnuté ✓
                    </button>

                    <button
                      onClick={() => {
                        setActiveErrorIndex((activeErrorIndex + 1) % errorQuestions.length);
                        setErrorSelectedAnswer(null);
                        setErrorShowExplanation(false);
                      }}
                      className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm"
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
                <p className="text-slate-400">Sestav si svých 20 maturitních děl. Procházej podrobné rozbory autorů, časoprostoru a struktury.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Vybráno: {userBookIds.length} / 20 knih
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 border border-slate-700"
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
                    className={`p-6 rounded-2xl border ${cardClass} flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {book.genre}
                        </span>
                        <button
                          onClick={() => toggleBookSelection(book.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={isSelected ? 'Odebrat ze seznamu' : 'Přidat do seznamu (20 knih)'}
                        >
                          {isSelected ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </div>

                      <h3 className="text-xl font-bold">{book.title}</h3>
                      <p className="text-sm text-indigo-400 font-semibold">{book.author}</p>
                      <p className="text-xs text-slate-400">{book.period}</p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedBookDetail(book);
                          setEditingNotes(userNotes[book.id] || '');
                        }}
                        className="w-full py-2 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 font-semibold text-xs transition-colors border border-indigo-500/30"
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
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl border ${cardClass} space-y-6 relative shadow-2xl`}>
                  <button
                    onClick={() => setSelectedBookDetail(null)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white font-bold text-lg"
                  >
                    ✕
                  </button>

                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{selectedBookDetail.period}</span>
                    <h2 className="text-3xl font-black mt-1">{selectedBookDetail.title}</h2>
                    <p className="text-indigo-300 font-semibold">{selectedBookDetail.author}</p>
                  </div>

                  <div className="space-y-4 text-sm text-slate-300">
                    <div>
                      <strong className="text-white block mb-1">Žánr & Druh:</strong>
                      <p className="p-3 rounded-xl bg-slate-800/50">{selectedBookDetail.genre}</p>
                    </div>

                    <div>
                      <strong className="text-white block mb-1">Časoprostor:</strong>
                      <p className="p-3 rounded-xl bg-slate-800/50">{selectedBookDetail.timeAndPlace}</p>
                    </div>

                    <div>
                      <strong className="text-white block mb-1">Téma & Motivy:</strong>
                      <p className="p-3 rounded-xl bg-slate-800/50">{selectedBookDetail.themeAndMotifs}</p>
                    </div>

                    <div>
                      <strong className="text-white block mb-1">Hlavní postavy:</strong>
                      <p className="p-3 rounded-xl bg-slate-800/50">{selectedBookDetail.characters}</p>
                    </div>

                    <div>
                      <strong className="text-white block mb-1">Stručný děj:</strong>
                      <p className="p-3 rounded-xl bg-slate-800/50 leading-relaxed">{selectedBookDetail.plotSummary}</p>
                    </div>

                    <div>
                      <strong className="text-white block mb-1">Jazyk & Styl:</strong>
                      <p className="p-3 rounded-xl bg-slate-800/50">{selectedBookDetail.languageAndStyle}</p>
                    </div>

                    {user && (
                      <div>
                        <strong className="text-white block mb-1">Moje osobní poznámky k rozboru:</strong>
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          placeholder="Přidejte si vlastní poznámky pro učitele nebo k maturitní otázce..."
                          className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                          rows={3}
                        />
                        <button
                          onClick={() => saveBookNotes(selectedBookDetail.id)}
                          className="mt-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
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
              <p className="text-slate-400">Přístup k e-knihám a nahrávkám zdarma z Městské knihovny v Praze (mlp.cz), OceansofPDF a Českého rozhlasu.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 rounded-2xl border ${cardClass} flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${item.type === 'audiobook' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {item.type === 'audiobook' ? '🎧 Audiokniha' : '📖 E-Kniha'}
                      </span>
                      <span className="text-xs text-slate-400">{item.format}</span>
                    </div>

                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-xs font-medium text-slate-400">Autor: <strong className="text-slate-200">{item.author}</strong></p>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    <span className="text-xs text-indigo-400 font-semibold block">Zdroj: {item.sourceName}</span>
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
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md shadow-purple-600/30"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Přehrát audioknihu v aplikaci
                      </button>
                    ) : (
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md shadow-indigo-600/30"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-8 rounded-3xl border ${cardClass} space-y-6 relative shadow-2xl`}>
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black">
                {authMode === 'login' ? 'Přihlášení do MaturYta' : 'Registrace nového účtu'}
              </h3>
              <p className="text-xs text-slate-400">
                Ukládejte si výsledky testů, procvičování chyb a maturitní četbu.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {authError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Uživatelské jméno {authMode === 'login' && '/ E-mail'}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="např. JanNovak"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@skola.cz"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Heslo</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={() => (authMode === 'login' ? handleLogin(false) : handleRegister())}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
              >
                {authMode === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
              </button>

              <button
                onClick={() => handleLogin(true)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
              >
                Vyzkoušet bez přihlášení (Host / Demo)
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs text-indigo-400 hover:underline font-semibold"
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
