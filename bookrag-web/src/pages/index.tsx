import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import logo from '../assets/logo-square.svg';
import bgImage from '../assets/background.png';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import ThinkingBubble from '../components/ThinkingBubble';
import dynamic from 'next/dynamic';
import { Info } from 'lucide-react';
import { BOOKS } from '../config/books';
import { TRANSLATIONS } from '../config/translations';

// Dynamically import PdfViewerPanel with SSR disabled
const PdfViewerPanel = dynamic(() => import('../components/PdfViewerPanel'), {
  ssr: false,
  loading: () => null
});

import { useChatStream } from '../hooks/useChatStream';

import BookDetailsModal from '../components/BookDetailsModal';
import BlurText from '../components/BlurText';

// Book Configuration Data
// Book Configuration Data
// Book Configuration Data
// Configs imported from ../config

// Helper component for background image transitions - REMOVED
// function BackgroundImage... - REMOVED

export default function Home() {
  const [currentBookId, setCurrentBookId] = useState('geografia');
  const [selectedPdfRef, setSelectedPdfRef] = useState<{ bookId: string; page: number } | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'English' | 'Arabic'>('English');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentBook = BOOKS[currentBookId];
  const t = TRANSLATIONS[currentLanguage];

  // Use the custom hook for Chat Logic
  const {
    messages,
    input,
    setInput,
    loading,
    searchStage,
    handleSubmit,
    clearChat
  } = useChatStream(currentBookId, t);

  // Clear chat when switching books
  const handleBookChange = (id: string) => {
    setCurrentBookId(id);
    clearChat();
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
            <div key={currentBookId} className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 relative">
              {/* Logo & Text - Added white glow/bg for readability on image */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative bg-white/80 backdrop-blur-md p-2 rounded-3xl mb-6 shadow-sm border border-white/50 animate-fade-in-up">
                  <Image src={logo} alt="MBZUAI Logo" width={70} height={70} className="object-contain" priority />
                </div>
                <BlurText
                  text={t.welcome}
                  delay={150}
                  animateBy="words"
                  direction="top"
                  className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight text-center mb-2 drop-shadow-sm justify-center"
                />
                <p className="text-slate-600 font-medium text-lg text-center backdrop-blur-sm bg-white/30 px-4 py-1 rounded-full animate-fade-in-up delay-200">
                  {t.askingAbout} <span className={`${currentBook.colors.text} font-bold`}>{currentBook.title}</span>
                </p>
              </div>

              {/* Input */}
              <div className="w-full animate-fade-in-up delay-300">
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
              <div className="w-full overflow-x-auto pb-4 md:pb-0 scrollbar-none snap-x flex justify-start md:justify-center py-2 animate-fade-in-up delay-500">
                <div className="flex flex-nowrap md:flex-wrap gap-3 w-max md:w-full md:justify-center px-1">
                  {currentBook.questions[currentLanguage].map((s, i) => {
                    const iconBgColor = currentBook.colors.fill;
                    const borderColor = currentBook.colors.border;

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
                      userColor={currentBook.colors.hex}
                      onReferenceClick={handleReferenceClick}
                      translations={t}
                    />
                  ))}
                  {loading && messages[messages.length - 1].role === 'user' && (
                    <ThinkingBubble currentStep={searchStage} />
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
        <PdfViewerPanel
          bookId={selectedPdfRef.bookId}
          page={selectedPdfRef.page}
          onClose={closePdfViewer}
        />
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
