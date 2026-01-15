import React, { useState } from 'react';
import Image from 'next/image';
import { Globe, Brain, Sparkles, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import logo from '../assets/mbzuai_logo.png';

interface HeaderProps {
  currentBookId: string;
  onBookChange: (id: string) => void;
  onClearChat?: () => void;
}

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

export default function Header({ currentBookId, onBookChange, onClearChat }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentBook = BOOK_TABS.find(b => b.id === currentBookId);

  return (
    <>
      <header className="relative flex-none bg-transparent px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-[100] transition-all duration-300">

        {/* Left: Logo */}
        <div className="flex items-center gap-3 z-[101]">
          <div className="relative h-9 md:h-10 w-auto transition-transform duration-300 hover:scale-105 active:scale-95">
            <Image
              src={logo}
              alt="MBZUAI Logo"
              width={140}
              height={50}
              className="object-contain drop-shadow-sm h-full w-auto"
              priority
            />
          </div>
        </div>

        {/* Desktop: Center Tabs */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2">
            {BOOK_TABS.map((book) => {
              const Icon = book.icon;
              const isActive = currentBookId === book.id;

              return (
                <button
                  key={book.id}
                  onClick={() => onBookChange(book.id)}
                  className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out border
                  ${isActive
                      ? `${book.bg} ${book.color} ${book.border} shadow-sm scale-105`
                      : `bg-transparent text-gray-500 border-transparent ${book.hover} hover:text-gray-900`
                    }
                `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? book.color : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span>{book.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 z-[101]">
          {/* Clear Chat Button */}
          {onClearChat && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-xs font-medium bg-white/50 hover:bg-white/80 border border-gray-200/60 hover:border-gray-300 rounded-full px-3 py-1.5 transition-all duration-200 active:scale-95"
              title="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {/* Mobile: Book Selector Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center gap-2 pl-3 pr-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-800 transition-all border border-gray-200"
          >
            <span className="truncate max-w-[120px]">{currentBook?.title || 'Select Book'}</span>
            {isMobileMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu Dropdown */}
          <div className="absolute top-[60px] right-4 left-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-[100] md:hidden animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col gap-1">
              {BOOK_TABS.map((book) => {
                const Icon = book.icon;
                const isActive = currentBookId === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      onBookChange(book.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isActive
                        ? `${book.bg} ${book.color} border border-${book.border} shadow-sm`
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? book.color : 'text-gray-400'}`} />
                    <span>{book.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
