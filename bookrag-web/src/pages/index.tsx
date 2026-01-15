import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import logo from '../assets/logo-square.svg';
import bgImage from '../assets/background.png';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import ThinkingBubble from '../components/ThinkingBubble';
import ParticleRing from '../components/ParticleRing';
import dynamic from 'next/dynamic';
import {
  BookOpen, Globe, Mountain, Waves,
  Compass, Ruler, Calculator, Coins,
  Star, History, BarChart, Orbit
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

// Book Configuration Data
const BOOKS_CONFIG: Record<string, { title: string; color: string; questions: { text: string; icon: React.ElementType }[] }> = {
  geografia: {
    title: "La Geografia",
    color: "text-teal-600",
    questions: [
      { text: "According to La Geografia, how is geography defined?", icon: BookOpen },
      { text: "What does the book explain about the importance of geography in understanding the Earth?", icon: Globe },
      { text: "How does La Geografia describe the surface of the Earth?", icon: Mountain },
      { text: "What are the major physical features mentioned in the book?", icon: Waves }
    ]
  },
  tractatus: {
    title: "Tractatus",
    color: "text-violet-600",
    questions: [
      { text: "How is the diameter of a sphere measured in Stereometry?", icon: Compass },
      { text: "How do you measure a tower's height from two stations?", icon: Ruler },
      { text: "How do you find the geometric mean using the instrument?", icon: Calculator },
      { text: "What rule is given for converting currencies?", icon: Coins }
    ]
  },
  tabulae: {
    title: "Tabulae Rudolphinae",
    color: "text-amber-600",
    questions: [
      { text: "What is the primary purpose of the Rudolphine Tables?", icon: Star },
      { text: "What event does Erasmus Reinhold mention in 1415? (Latin: Erasmus Reinholdus meminit Eclipsis Solis Anno 1415)", icon: History },
      { text: "What role did Tycho Brahe's data play in creating these tables?", icon: BarChart },
      { text: "How are the planetary positions calculated in this work?", icon: Orbit }
    ]
  }
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBookId, setCurrentBookId] = useState('geografia');
  const [selectedPdfRef, setSelectedPdfRef] = useState<{ bookId: string; page: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentBook = BOOKS_CONFIG[currentBookId];

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
          mode: 'naive',
          book_id: currentBookId // Send selected book ID
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      const aiMsg: Message = { role: 'assistant', content: '', references: [] };
      setMessages(prev => [...prev, aiMsg]);

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

              // Map chunks to Reference objects
              const newRefs: Reference[] = chunks.map((c: { content?: string }) => {
                if (!c.content) return null;
                const match = c.content.match(/\[(?:SOURCE:)?\s*Page\s*(\d+)\]/i);
                if (!match) return null; // Skip if no page number found
                return {
                  page: match[1],
                  text: c.content
                };
              }).filter((r: Reference | null) => r !== null) as Reference[];

              console.log('[DEBUG] Parsed refs from context:', newRefs.length, newRefs);

              // Deduplicate based on PAGE number, not text
              const uniqueRefs = newRefs.filter((ref, index, self) =>
                index === self.findIndex((r) => r.page === ref.page)
              );

              console.log('[DEBUG] Unique refs after dedup:', uniqueRefs.length, uniqueRefs);

              setMessages(prev => {
                const newHistory = [...prev];
                const currentRefs = newHistory[newHistory.length - 1].references || [];
                // Merge and deduplicate by page
                const combined = [...currentRefs, ...uniqueRefs].filter((ref, index, self) =>
                  index === self.findIndex((r) => r.page === ref.page)
                );

                newHistory[newHistory.length - 1].references = combined;
                return newHistory;
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

                // Fallback: Always parse text content for references since backend returns 0 chunks.
                // Run on every delta to accumulate all references as text streams in.
                const textRefs: Reference[] = [];

                // Match multiple patterns:
                // 1. "- [1] Page 15" or "- [2] Some Title"
                // 2. "[1] Page 15" at start of line
                // 3. "1. Page 15" numbered list format
                const patterns = [
                  /[-*]\s*\[(\d+)\]\s*(.+)/g,           // - [1] text
                  /^\[(\d+)\]\s*(.+)/gm,                // [1] text at line start
                  /^(\d+)\.\s*(Page\s*\d+.*)$/gm,       // 1. Page 15
                  /\[(?:SOURCE:)?\s*Page\s*(\d+)\]/gi,  // [Page 15] or [SOURCE: Page 15] inline
                ];

                for (const pattern of patterns) {
                  const matches = [...newContent.matchAll(pattern)];
                  matches.forEach(m => {
                    // Handle inline [Page X] pattern where only m[1] (page) exists, no m[2] (text)
                    if (!m[2] && m[1]) {
                      textRefs.push({
                        page: m[1],
                        text: `Page ${m[1]}`
                      });
                      return;
                    }

                    const refText = m[2] ? m[2].trim() : '';
                    if (!refText) return;

                    // Extract page number from text like "Page 15"
                    const pageMatch = refText.match(/Page\s+(\d+)/i);

                    textRefs.push({
                      page: pageMatch ? pageMatch[1] : '1',
                      text: refText
                    });
                  });
                }

                // Deduplicate by PAGE NUMBER to keep all unique pages
                const uniqueTextRefs = textRefs.filter((ref, index, self) =>
                  index === self.findIndex((r) => r.page === ref.page)
                );

                // Merge with existing references (from context or previous deltas)
                const currentRefs = newHistory[idx].references || [];
                const mergedRefs = [...currentRefs, ...uniqueTextRefs];

                // Final deduplication
                const finalRefs = mergedRefs.filter((ref, index, self) =>
                  index === self.findIndex((r) => r.page === ref.page)
                );

                if (finalRefs.length > 0) {
                  newHistory[idx].references = finalRefs;
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I am unable to check the library right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen font-sans text-slate-800 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage.src})` }}>
      <Head>
        <title>MBZUAI AI Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header currentBookId={currentBookId} onBookChange={handleBookChange} onClearChat={clearChat} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 sm:px-8 py-6 md:py-10 custom-scrollbar">

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 md:space-y-10 animate-fade-in pt-20 md:pt-32">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                  <ParticleRing />
                </div>
                {/* Logo Container */}
                <div className="relative z-10 bg-white/95 backdrop-blur-md p-1.5 rounded-3xl shadow-lg border border-white/50">
                  <Image src={logo} alt="MBZUAI Logo" width={72} height={72} className="object-contain" />
                </div>
              </div>

              <div className="text-center space-y-3 max-w-lg">
                <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                  Welcome to LawaAI BookChat
                </h2>
                <p className="text-gray-500 font-medium text-lg">
                  Asking about <span className={`${currentBook.color} font-bold`}>{currentBook.title}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl pt-2 px-2">
                {currentBook.questions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s.text)}
                    className="cursor-pointer flex items-start space-x-4 p-3 bg-white/60 border border-white/50 hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 rounded-2xl transition-all duration-300 text-sm font-medium text-gray-600 hover:text-indigo-600 backdrop-blur-sm group text-left h-full"
                  >
                    <span className={`p-2 rounded-lg bg-indigo-50/50 group-hover:bg-indigo-100 transition-colors duration-300`}>
                      <s.icon className={`w-6 h-6 ${currentBook.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    </span>
                    <span className="line-clamp-3 leading-relaxed">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-4">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  message={msg}
                  isStreaming={loading && idx === messages.length - 1 && msg.role === 'assistant'}
                  bookId={currentBookId}
                  userColor={currentBookId === 'geografia' ? '#0d9488' : currentBookId === 'tractatus' ? '#7c3aed' : '#d97706'}
                  onReferenceClick={handleReferenceClick}
                />
              ))}

              {loading && messages[messages.length - 1].role === 'user' && (
                <ThinkingBubble />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        loading={loading}
        messagesLength={messages.length}
        clearChat={clearChat}
      />

      {/* PDF Viewer Panel */}
      {selectedPdfRef && (
        <PdfViewerPanel
          bookId={selectedPdfRef.bookId}
          page={selectedPdfRef.page}
          onClose={closePdfViewer}
        />
      )}
    </div>
  );
}
