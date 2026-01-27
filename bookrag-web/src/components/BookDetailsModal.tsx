import React from 'react';
import Image from 'next/image';
import { X, Globe, Brain, Activity } from 'lucide-react';
import { StaticImageData } from 'next/image';

// Fallback images if generation fails (using the book identifier to distinct)
// In a real scenario, we would use the generated images.
// For now, I will accept an imageSrc prop.

interface BookDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: {
        id: string;
        title: string;
        description: string;
        visualSrc?: string | StaticImageData;
        details?: {
            author: string;
            year: string;
            genre: string;
            language: string;
        };
        features?: string[];
        significance?: string;
        color: string;
        bgColor: string;
        icon: any;
    };
    t: any;
}

export default function BookDetailsModal({ isOpen, onClose, book, t }: BookDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-6">
            {/* Backdrop - Light & Airy */}
            <div
                className="absolute inset-0 bg-slate-200/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Container - Clean "Paper" Look */}
            <div className="relative w-full max-w-3xl bg-white md:rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col h-full md:max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">

                {/* Close Button */}
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/80 hover:bg-white border border-slate-200 rounded-full text-slate-500 hover:text-red-500 shadow-sm transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* 1. Hero Image (Clean, No Overlay) */}
                    <div className="relative w-full h-64 md:h-80 bg-slate-50 border-b border-slate-100">
                        {book.visualSrc ? (
                            <Image
                                src={book.visualSrc}
                                alt={book.title}
                                fill
                                className="object-cover"
                                priority
                                unoptimized
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: book.bgColor }}>
                                <book.icon className="w-32 h-32 text-white/50" />
                            </div>
                        )}
                    </div>

                    {/* 2. Structured Content (Light Theme) */}
                    <div className="px-8 md:px-12 py-10 space-y-8">

                        {/* Header Section */}
                        <div className="space-y-4 border-b border-slate-100 pb-8">
                            {book.details && (
                                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                                    <span className={book.color}>{book.details.genre}</span>
                                    <span>•</span>
                                    <span>{book.details.year}</span>
                                </div>
                            )}
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                                {book.title}
                            </h1>
                            {book.details && (
                                <div className="flex items-center gap-2 text-slate-600 font-medium text-lg">
                                    <span>By {book.details.author}</span>
                                </div>
                            )}
                        </div>

                        {/* Introduction */}
                        <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed">
                            <p>
                                {book.description}
                            </p>
                        </div>

                        {/* Key Features Grid (Clean Cards) */}
                        {book.features && (
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-900 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-slate-400" /> Key Insights
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {book.features.map((feature, idx) => (
                                        <div key={idx} className="p-5 rounded-xl bg-white border border-slate-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:border-slate-300 transition-colors">
                                            <div className={`mb-3 w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 ${book.color}`}>
                                                <div className={`w-2 h-2 rounded-full ${book.color.replace('text-', 'bg-')}`} />
                                            </div>
                                            <span className="text-slate-700 text-sm font-medium leading-relaxed block">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Historical Significance (Light Box) */}
                        {book.significance && (
                            <div className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-200 p-8">
                                <div className="relative z-10">
                                    <h3 className="text-slate-900 font-bold text-lg mb-3 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-slate-400" /> Historical Impact
                                    </h3>
                                    <p className="leading-relaxed text-slate-600 italic">
                                        "{book.significance}"
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
