import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image, { StaticImageData } from 'next/image';
import logo from '../assets/logo-square.svg';
import bgImage from '../assets/background.png';
import firstBook from '../assets/first book.jpg';
import secondBook from '../assets/second-book.png';
import thirdBook from '../assets/third-book.jpg';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import ThinkingBubble from '../components/ThinkingBubble';
import OrbNavigation from '../components/OrbNavigation';
import dynamic from 'next/dynamic';
import {
  BookOpen, Globe, Mountain, Waves,
  Compass, Ruler, Calculator, Coins,
  Star, History, BarChart, Orbit,
  ArrowUpRight, Plus, Info, // Added Info
  Brain, Activity // Added Brain, Activity
} from 'lucide-react';

// Dynamically import PdfViewerPanel with SSR disabled
const PdfViewerPanel = dynamic(() => import('../components/PdfViewerPanel'), {
  ssr: false,
  loading: () => null
});

interface Reference {
  page: string;
  text: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  references?: Reference[];
}

import BookDetailsModal from '../components/BookDetailsModal'; // Added Modal

// Book Configuration Data
// Book Configuration Data
// Book Configuration Data
const BOOKS_CONFIG: Record<string, {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  icon: any;
  visualSrc: string | StaticImageData;
  details: {
    author: string;
    year: string;
    genre: string;
    language: string;
  };
  description: string;
  features: string[];
  significance: string;
  questions: Record<string, { text: string; label: string; icon: React.ElementType }[]>
}> = {
  geografia: {
    id: 'geografia',
    title: "Geographia",
    color: "text-teal-600",
    bgColor: "#0d9488",
    icon: Globe,
    visualSrc: firstBook,
    details: {
      author: "Claudius Ptolemy",
      year: "c. 150 AD",
      genre: "Atlas / Cartography",
      language: "Ancient Greek"
    },
    description: `The *Geographia* (Geography) is a compilation of geographical coordinates and a treatise on cartography that defined the field for centuries. Written in Alexandria, it introduced the revolutionary concept of global coordinates (latitude and longitude) to map the known world. Ptolemy provided instructions for creating map projections to represent the curved Earth on a flat plane, transitioning map-making from an artistic endeavor to a mathematical discipline.`,
    features: [
      "Introduced the grid system of latitude and longitude.",
      "Described map projections for the spherical Earth.",
      "Cataloged coordinates for over 8,000 locations.",
      "Differentiated between Geography (global) and Chorography (regional)."
    ],
    significance: "Lost to the West for a millennium, its rediscovery in the 15th century sparked the Renaissance in cartography, directly influencing the Age of Exploration and the maps used by Columbus.",
    questions: {
      English: [
        { label: "Geography Definition", text: "How does Ptolemy define Geography versus Chorography?", icon: BookOpen },
        { label: "Map Projections", text: "What methods does the book describe for projecting a sphere onto a plane?", icon: Globe },
        { label: "Oikumene", text: "How does Ptolemy describe the extent of the known inhabited world (Oikumene)?", icon: Mountain },
        { label: "Coordinate System", text: "How does the book utilize latitude and longitude to locate cities?", icon: Waves }
      ],
      Arabic: [
        { label: "تعريف الجغرافيا", text: "كيف يميز بطليموس بين الجغرافيا والكوروغرافيا؟", icon: BookOpen },
        { label: "إسقاط الخرائط", text: "ما هي الطرق التي يصفها الكتاب لإسقاط الكرة على سطح مستو؟", icon: Globe },
        { label: "المعمورة", text: "كيف يصف بطليموس حدود العالم المسكون (المعمورة)؟", icon: Mountain },
        { label: "نظام الإحداثيات", text: "كيف يستخدم الكتاب خطوط الطول والعرض لتحديد مواقع المدن؟", icon: Waves }
      ]
    }
  },
  tractatus: {
    id: 'tractatus',
    title: "Tractatus Logico-Philosophicus",
    color: "text-violet-600",
    bgColor: "#7c3aed",
    icon: Brain,
    visualSrc: secondBook,
    details: {
      author: "Ludwig Wittgenstein",
      year: "1921",
      genre: "Philosophical Logic",
      language: "German"
    },
    description: `The *Tractatus Logico-Philosophicus* is the only book-length philosophical work published by Ludwig Wittgenstein during his lifetime. It aims to define the relationship between language and reality and to delimit the sphere of the sayable. The work is structured as a series of 525 hierarchically numbered assertions, famously concluding: "Whereof one cannot speak, thereof one must be silent." It presents the "picture theory" of meaning, arguing that language represents the world by mirroring the logical form of facts.`,
    features: [
      "Asserts that 'The world is everything that is the case.'",
      "Presents the 'Picture Theory' of meaning.",
      "Distinguishes between what can be said and what must be shown.",
      "Seven main propositions numbered 1 to 7."
    ],
    significance: "A seminal work of 20th-century analytic philosophy, it profoundly influenced the Vienna Circle and Logical Positivism, though Wittgenstein later critiqued its conclusions.",
    questions: {
      English: [
        { label: "Sphere Measurement", text: "How is the diameter of a sphere measured in Stereometry?", icon: Compass },
        { label: "Tower Height", text: "How do you measure a tower's height from two stations?", icon: Ruler },
        { label: "Geometric Mean", text: "How do you find the geometric mean using the instrument?", icon: Calculator },
        { label: "Currency Conversion", text: "What rule is given for converting currencies?", icon: Coins }
      ],
      Arabic: [
        { label: "قياس الكرة", text: "كيف يتم قياس قطر الكرة في علم القياس المجسم؟", icon: Compass },
        { label: "ارتفاع البرج", text: "كيف تقيس ارتفاع برج من محطتين؟", icon: Ruler },
        { label: "الوسط الهندسي", text: "كيف تجد الوسط الهندسي باستخدام الأداة؟", icon: Calculator },
        { label: "تحويل العملات", text: "ما هي القاعدة المذكورة لتحويل العملات؟", icon: Coins }
      ]
    }
  },
  tabulae: {
    id: 'tabulae',
    title: "Tabulae Rudolphinae",
    color: "text-amber-600",
    bgColor: "#d97706",
    icon: Activity,
    visualSrc: thirdBook,
    details: {
      author: "Johannes Kepler",
      year: "1627",
      genre: "Astronomy / Star Catalog",
      language: "Latin"
    },
    description: `The *Tabulae Rudolphinae* (Rudolphine Tables) is a star catalog and set of planetary tables published by Johannes Kepler in 1627, based on the observational data of Tycho Brahe. Dedicated to Emperor Rudolf II, it was the first catalog to include corrective factors for atmospheric refraction and logarithmic tables. It allowed for the calculation of planetary positions with unprecedented accuracy, providing strong support for the heliocentric model of the solar system.`,
    features: [
      "Based on the precise observations of Tycho Brahe.",
      "First use of logarithms in astronomical tables.",
      "Included corrections for atmospheric refraction.",
      "Predicted the transit of Mercury and Venus."
    ],
    significance: "The tables were significantly more accurate than previous ones and served as the standard for astronomy for over a century, cementing the acceptance of the heliocentric model.",
    questions: {
      English: [
        { label: "Primary Purpose", text: "What is the primary purpose of the Rudolphine Tables?", icon: Star },
        { label: "Reinhold's Event", text: "What event does Erasmus Reinhold mention in 1415?", icon: History },
        { label: "Brahe's Data", text: "What role did Tycho Brahe's data play in creating these tables?", icon: BarChart },
        { label: "Planetary Positions", text: "How are the planetary positions calculated in this work?", icon: Orbit }
      ],
      Arabic: [
        { label: "الغرض الأساسي", text: "ما هو الغرض الأساسي من الجداول الرودلفية؟", icon: Star },
        { label: "حدث راينهولد", text: "ما هو الحدث الذي ذكره إيراسموس راينهولد في عام 1415؟", icon: History },
        { label: "بيانات براهي", text: "ما هو الدور الذي لعبته بيانات تايكو براهي في إنشاء هذه الجداول؟", icon: BarChart },
        { label: "حساب الكواكب", text: "كيف يتم حساب مواقع الكواكب في هذا العمل؟", icon: Orbit }
      ]
    }
  }
};

const BOOKS_LIST = Object.entries(BOOKS_CONFIG).map(([id, config]) => ({
  id,
  title: config.title,
  color: config.color
}));

// Language Configuration
const TRANSLATIONS = {
  English: {
    welcome: "LawaAI BookChat",
    askingAbout: "Asking about",
    placeholder: "Write your question here...",
    send: "Send",
    clear: "Clear Chat",
    error: "Sorry, I am unable to check the library right now. Please try again later.",
    disclaimer: "AI assistant can give wrong answers. Please verify information with official sources.",
    poweredBy: "Powered by",
    sources: "Sources",
    page: "Page"
  },
  Arabic: {
    welcome: "LawaAI BookChat",
    askingAbout: "تسأل عن",
    placeholder: "اكتب سؤالك هنا...",
    send: "إرسال",
    clear: "مسح المحادثة",
    error: "عذراً، لا يمكنني التحقق من المكتبة الآن. يرجى المحاولة لاحقاً.",
    disclaimer: "المساعد الذكي قد يخطئ. يرجى التحقق من المصادر الرسمية.",
    poweredBy: "مدعوم من",
    sources: "المصادر",
    page: "صفحة"
  }
};

// Helper component for background image transitions - REMOVED
// function BackgroundImage... - REMOVED

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBookId, setCurrentBookId] = useState('geografia');
  const [selectedPdfRef, setSelectedPdfRef] = useState<{ bookId: string; page: number } | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'English' | 'Arabic'>('English'); // Language State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // New State

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentBook = BOOKS_CONFIG[currentBookId];
  const t = TRANSLATIONS[currentLanguage]; // Start using translations

  // Clear chat when switching books
  const handleBookChange = (id: string) => {
    setCurrentBookId(id);
    setMessages([]);
    setSelectedPdfRef(null);
  };

  const handleReferenceClick = (bookId: string, page: number) => {
    setSelectedPdfRef({ bookId, page });
  };

  const closePdfViewer = () => {
    setSelectedPdfRef(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSuggestion = (text: string) => {
    handleSubmit(text);
  };

  const handleSubmit = async (queryOverride?: string) => {
    const finalQuery = (typeof queryOverride === 'string' ? queryOverride : input).trim();
    if (!finalQuery || loading) return;

    const query = finalQuery;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      // Use env variable or window.location.hostname
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:8000`;
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          mode: 'hybrid',
          book_id: currentBookId, // Send selected book ID
          language: currentLanguage // Send selected language
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      const aiMsg: Message = { role: 'assistant', content: '', references: [] };
      setMessages(prev => [...prev, aiMsg]);

      // Temporary storage for retrieved chunks (Page Number -> Chunk Data)
      const contextMap = new Map<string, string>();

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);

            if (json.type === 'context') {
              const chunks = json.data.chunks || json.data.text_chunks || [];
              console.log('[DEBUG] Context received - chunks:', chunks.length, chunks);


              // Store chunks in map for lookup, but DO NOT display them yet
              chunks.forEach((c: { content?: string }) => {
                if (!c.content) return;
                const match = c.content.match(/\[(?:SOURCE:)?\s*Page\s*(\d+)\]/i);
                if (match && match[1]) {
                  contextMap.set(match[1], c.content);
                }
              });

            } else if (json.type === 'delta') {
              setMessages(prev => {
                const newHistory = [...prev];
                const idx = newHistory.length - 1;
                const newContent = newHistory[idx].content + json.content;

                newHistory[idx] = {
                  ...newHistory[idx],
                  content: newContent,
                };

                // Parsing Logic: Extract [Page N] from the accumulator text
                const textRefs: Reference[] = [];

                // Match [Page N] or [SOURCE: Page N]
                const pagePattern = /\[(?:SOURCE:)?\s*Page\s*(\d+)\]/gi;
                const matches = [...newContent.matchAll(pagePattern)];

                matches.forEach(m => {
                  const pageNum = m[1];
                  // Look up the full text from our context map
                  // If not found (hallucination?), we can fallback to just showing the page number or ignoring it.
                  // Let's fallback to showing "Page N" with empty text if missing context, 
                  // BUT per requirement we should only extract what we have. 
                  // Actually, if it's in the text, it's cited.
                  const fullText = contextMap.get(pageNum) || `Page ${pageNum}`;

                  textRefs.push({
                    page: pageNum,
                    text: fullText
                  });
                });

                // Deduplicate by PAGE NUMBER
                const uniqueTextRefs = textRefs.filter((ref, index, self) =>
                  index === self.findIndex((r) => r.page === ref.page)
                );

                // Update references ONLY from text extraction
                if (uniqueTextRefs.length > 0) {
                  newHistory[idx].references = uniqueTextRefs;
                }

                return newHistory;
              });
            }
          } catch (err) {
            console.error("Error parsing JSON chunk", err);
          }
        }
      }

    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: t.error }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Determine Theme Class
  const getThemeClass = () => {
    switch (currentBookId) {
      case 'geografia': return 'theme-nature';
      case 'tractatus': return 'theme-glass';
      case 'tabulae': return 'theme-cosmic';
      default: return 'theme-nature';
    }
  };

  // Render Dynamic Background - REMOVED
  // const renderBackground...

  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setFooterHeight(entry.contentRect.height);
      }
    });
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`h-[100dvh] w-full font-sans text-slate-800 overflow-hidden relative ${currentLanguage === 'Arabic' ? 'font-arabic' : ''} ${getThemeClass()}`} dir={currentLanguage === 'Arabic' ? 'rtl' : 'ltr'}>
      <Head>
        <title>MBZUAI AI Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, interactive-widget=resizes-content" />
      </Head>

      {/* 1. Global Background Image - Fully Occupies Window */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0"
          style={{
            maskImage: 'radial-gradient(circle at center, black 100%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 100%, transparent 100%)'
          }}>
          <Image
            src={bgImage}
            alt="Background"
            fill
            className="object-cover"
            quality={100}
            priority
          />
        </div>
        {/* Whitish Overlay */}
        <div className="absolute inset-0 bg-white/10 z-[1]" />
      </div>

      {/* 2. Header - Floating Top */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header
          currentBookId={currentBookId}
          onBookChange={handleBookChange}
          onClearChat={clearChat}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      </div>

      {/* 3. Sidebar - Floating Left */}
      {/* <aside className="fixed left-0 top-0 h-full w-20 z-40 flex flex-col items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <OrbNavigation
            currentBookId={currentBookId}
            onBookChange={handleBookChange}
            books={BOOKS_LIST}
          />
        </div>
      </aside> */}

      {/* 4. Main Content Overlay - Fills Window but respects Header/Sidebar space */}
      <main className="absolute inset-0 z-10 flex flex-col pt-20 transition-all duration-300">

        {/* Info Button - Fixed Bottom Right */}
        <div className="absolute bottom-6 right-6 z-50">
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="p-3 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-slate-700 hover:scale-105 transition-all shadow-lg group relative"
            title="View Book Details"
          >
            <Info className="w-5 h-5" />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Book Info
            </span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {messages.length === 0 ? (
            /* -- HERO STATE -- */
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 animate-fade-in relative">
              {/* Logo & Text - Added white glow/bg for readability on image */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative bg-white/80 backdrop-blur-md p-2 rounded-3xl mb-6 shadow-sm border border-white/50">
                  <Image src={logo} alt="MBZUAI Logo" width={80} height={80} className="object-contain" priority />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight text-center mb-2 drop-shadow-sm">
                  {t.welcome}
                </h2>
                <p className="text-slate-600 font-medium text-lg text-center backdrop-blur-sm bg-white/30 px-4 py-1 rounded-full">
                  {t.askingAbout} <span className={`${currentBook.color} font-bold`}>{currentBook.title}</span>
                </p>
              </div>

              {/* Input */}
              <div className="w-full">
                <ChatInput
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  messagesLength={0}
                  clearChat={clearChat}
                  translations={t}
                />
              </div>

              {/* Suggestions */}
              <div className="w-full overflow-x-auto pb-4 md:pb-0 scrollbar-none snap-x flex justify-start md:justify-center py-2">
                <div className="flex flex-nowrap md:flex-wrap gap-3 w-max md:w-full md:justify-center px-1">
                  {currentBook.questions[currentLanguage].map((s, i) => {
                    const iconBgColor = currentBookId === 'geografia' ? 'bg-teal-600' :
                      currentBookId === 'tractatus' ? 'bg-violet-600' : 'bg-amber-600';

                    const borderColor = currentBookId === 'geografia' ? 'border-teal-100 hover:border-teal-300' :
                      currentBookId === 'tractatus' ? 'border-violet-100 hover:border-violet-300' :
                        'border-amber-100 hover:border-amber-300';

                    return (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(s.text)}
                        className={`flex-none snap-start cursor-pointer group flex items-center gap-2 ps-1.5 pe-3 py-1.5 bg-white/80 backdrop-blur-md border ${borderColor} rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5`}
                      >
                        <div className={`w-6 h-6 rounded-full ${iconBgColor} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                          <s.icon className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 whitespace-nowrap">
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* -- CHAT STATE -- */
            <>
              <div
                className="flex-1 overflow-y-auto w-full custom-scrollbar relative"
                style={{
                  maskImage: `linear-gradient(to bottom, black calc(100% - ${footerHeight}px - 20px), transparent calc(100% - ${footerHeight}px))`,
                  WebkitMaskImage: `linear-gradient(to bottom, black calc(100% - ${footerHeight}px - 20px), transparent calc(100% - ${footerHeight}px))`,
                }}
              >
                <div
                  className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-6 md:py-10 space-y-8 animate-fade-in"
                  style={{ paddingBottom: `${footerHeight + 120}px` }}
                >
                  {messages.map((msg, idx) => (
                    <ChatMessage
                      key={idx}
                      message={msg}
                      isStreaming={loading && idx === messages.length - 1 && msg.role === 'assistant'}
                      bookId={currentBookId}
                      userColor={currentBookId === 'geografia' ? '#0d9488' : currentBookId === 'tractatus' ? '#7c3aed' : '#d97706'}
                      onReferenceClick={handleReferenceClick}
                      translations={t}
                    />
                  ))}
                  {loading && messages[messages.length - 1].role === 'user' && (
                    <ThinkingBubble />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Bottom Input - Floating Glass */}
              <div
                ref={footerRef}
                className="absolute bottom-0 w-full z-30 pt-4 px-4 pointer-events-none backdrop-blur-[2px]"
              >
                <div className="max-w-3xl mx-auto pointer-events-auto">
                  <ChatInput
                    input={input}
                    setInput={setInput}
                    handleSubmit={handleSubmit}
                    loading={loading}
                    messagesLength={messages.length}
                    clearChat={clearChat}
                    translations={t}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer (Transparent/Floating) */}
        <footer className="flex-none px-4 md:px-6 py-3 z-30 text-slate-500/80 hover:text-slate-600 transition-colors relative flex flex-col-reverse md:block">

          {/* Left: Powered By */}
          <div className="flex items-center justify-center md:justify-start gap-2.5 md:absolute md:left-6 md:top-1/2 md:-translate-y-1/2 mt-2 md:mt-0">
            <div className="flex h-2 w-2 relative" title="System Online">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <p className="text-xs font-medium">
              {t.poweredBy} <span className="font-semibold">LawaAI</span>
            </p>
          </div>

          {/* Center: Disclaimer */}
          <div className="text-center w-full max-w-2xl mx-auto">
            <p className="text-[10px] md:text-xs font-medium leading-relaxed">
              {t.disclaimer}
            </p>
          </div>

        </footer>
      </main>

      {/* PDF Viewer Panel Overlay */}
      {selectedPdfRef && (
        <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full md:w-2/3 h-full bg-white shadow-2xl relative animate-slide-in-right">
            <PdfViewerPanel
              bookId={selectedPdfRef.bookId}
              page={selectedPdfRef.page}
              onClose={closePdfViewer}
            />
          </div>
        </div>
      )}
      <BookDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        book={currentBook}
        t={t}
      />
    </div>

  );
}
