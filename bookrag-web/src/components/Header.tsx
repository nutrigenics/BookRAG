import React, { useState } from 'react';
import Image from 'next/image';
import { Globe, Brain, Sparkles, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import logo from '../assets/mbzuai_logo.png';
import orb1 from '../assets/planet-orb-1.png';
import orb2 from '../assets/planet-orb-2.png';
import orb3 from '../assets/planet-orb-3.png';

interface HeaderProps {
  currentBookId: string;
  onBookChange: (id: string) => void;
  onClearChat?: () => void;
  currentLanguage: 'English' | 'Arabic';
  onLanguageChange: (lang: 'English' | 'Arabic') => void;
}

const getOrbImage = (id: string) => {
  switch (id) {
    case 'geografia': return orb1;
    case 'tractatus': return orb2;
    case 'tabulae': return orb3;
    default: return orb1;
  }
};

const BOOK_TABS = [
  {
    id: 'geografia',
    title: 'La Geografia',
    icon: Globe,
    color: 'text-teal-600',
    bgColor: '#0d9488', // teal-600
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    hover: 'hover:bg-teal-50'
  },
  {
    id: 'tractatus',
    title: 'Tractatus',
    icon: Brain,
    color: 'text-violet-600',
    bgColor: '#7c3aed', // violet-600
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    hover: 'hover:bg-violet-50'
  },
  {
    id: 'tabulae',
    title: 'Tabulae Rudolphinae',
    icon: Sparkles,
    color: 'text-amber-600',
    bgColor: '#d97706', // amber-600
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    hover: 'hover:bg-amber-50'
  },
];

export { BOOK_TABS };

export default function Header({ currentBookId, onBookChange, onClearChat, currentLanguage, onLanguageChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isBookMenuOpen, setIsBookMenuOpen] = useState(false); // New state for book dropdown
  const currentBook = BOOK_TABS.find(b => b.id === currentBookId);

  return (
    <>
      <header className="relative flex-none bg-transparent px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-[100]">

        {/* Left: Logo */}
        <div className="flex items-center gap-3 z-[101]">
          <div className="relative h-9 md:h-10 w-auto transition-transform duration-300 hover:scale-105 active:scale-95">
            <Image
              src={logo}
              alt="MBZUAI Logo"
              className="object-contain drop-shadow-sm h-full w-auto"
              priority
            />
          </div>
        </div>

        {/* Center: Book Switcher */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101]">
          {/* Book Switcher - Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBookMenuOpen(!isBookMenuOpen)}
              className="group flex items-center gap-2 ps-1.5 pe-4 py-1.5 h-11 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-full hover:border-slate-300 hover:shadow-md transition-all duration-300"
            >
              {/* Orb Circle */}
              <div className="w-8 h-8 rounded-full overflow-hidden relative border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Image
                  src={getOrbImage(currentBookId)}
                  alt={currentBook?.title || 'Book'}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Text */}
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 max-w-[120px] truncate hidden md:block">
                {currentBook?.title}
              </span>

              {/* Chevron */}
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isBookMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Book Dropdown Menu */}
            {isBookMenuOpen && (
              <div className="absolute top-full start-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                {BOOK_TABS.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => { onBookChange(book.id); setIsBookMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center gap-3 ${currentBookId === book.id ? 'bg-slate-50' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full overflow-hidden relative border ${currentBookId === book.id ? 'border-slate-400' : 'border-slate-100'}`}>
                      <Image
                        src={getOrbImage(book.id)}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className={`flex-1 ${currentBookId === book.id ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                      {book.title}
                    </span>
                    {currentBookId === book.id && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Language Switcher */}
        <div className="flex items-center gap-3 z-[101]">
          {/* Language Switcher - Pill Style */}
          <div className="relative w-34">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="group flex items-center justify-between ps-1.5 pe-4 py-1.5 h-11 w-full bg-white/80 backdrop-blur-sm border border-slate-300 rounded-full hover:border-slate-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                {/* Icon Circle */}
                <div
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: currentBook?.bgColor || '#0d9488' }}
                >
                  <Globe className="w-4 h-4" />
                </div>

                {/* Text */}
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 hidden md:block">
                  {currentLanguage === 'English' ? 'English' : 'العربية'}
                </span>
              </div>

              {/* Chevron */}
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isLangMenuOpen && (
              <div className="absolute top-full end-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => { onLanguageChange('English'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${currentLanguage === 'English' ? 'font-bold text-slate-900 bg-slate-50' : 'text-slate-600'}`}
                >
                  English
                </button>
                <button
                  onClick={() => { onLanguageChange('Arabic'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${currentLanguage === 'Arabic' ? 'font-bold text-slate-900 bg-slate-50' : 'text-slate-600'}`}
                >
                  العربية
                </button>
              </div>
            )}
          </div>
        </div>

      </header>
    </>
  );
}
