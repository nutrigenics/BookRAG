import React from 'react';
import Image from 'next/image';
import orb1 from '../assets/planet-orb-1.png';
import orb2 from '../assets/planet-orb-2.png';
import orb3 from '../assets/planet-orb-3.png';

interface OrbNavigationProps {
    currentBookId: string;
    onBookChange: (bookId: string) => void;
    books: { id: string; title: string; color: string }[];
}

export default function OrbNavigation({ currentBookId, onBookChange, books }: OrbNavigationProps) {

    const getOrbLayers = (id: string, isActive: boolean) => {
        // Determine which image to use based on id
        let orbImage;
        switch (id) {
            case 'geografia': orbImage = orb1; break;
            case 'tractatus': orbImage = orb2; break;
            case 'tabulae': orbImage = orb3; break;
            default: orbImage = orb1;
        }

        return (
            <div className={`absolute inset-0 rounded-full overflow-hidden transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                <Image
                    src={orbImage}
                    alt={id}
                    fill
                    className={`object-cover ${isActive ? 'animate-spin-slow' : ''}`}
                />
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative flex flex-col items-center gap-10">
                {/* Connecting Vertical Line - Extended & Faded (Warm Tone) */}
                <div className="absolute -top-8 -bottom-8 w-[2px] bg-gradient-to-b from-transparent via-amber-900/10 to-transparent -z-10" />

                {books.map((book) => {
                    const isActive = currentBookId === book.id;

                    // Reverted: Dynamic Border Colors (Emerald, Indigo, Amber) & Shadow intensity
                    const borderStyles: Record<string, string> = {
                        geografia: isActive ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'border-emerald-200 group-hover:border-emerald-500',
                        tractatus: isActive ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'border-indigo-200 group-hover:border-indigo-500',
                        tabulae: isActive ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-amber-200 group-hover:border-amber-500',
                    };

                    return (
                        <div
                            key={book.id}
                            className={`w-12 h-12 rounded-full cursor-pointer z-10 transition-all duration-500 relative group flex items-center justify-center
                              ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'}
                            `}
                            onClick={() => onBookChange(book.id)}
                        >
                            {/* The Planet Orb with Themed Solid Border (border-2) */}
                            <div className={`w-full h-full rounded-full relative overflow-hidden border-2 transition-all duration-300 bg-white 
                                ${borderStyles[book.id]}`}>
                                {getOrbLayers(book.id, isActive)}
                            </div>

                            {/* Label Tooltip - Restored darker contrast for pop */}
                            <div className="absolute start-full ms-5 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl pointer-events-none z-20 translate-x-2 group-hover:translate-x-0 whitespace-nowrap">
                                {book.title}
                                {/* Triangle */}
                                <div className="absolute end-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-e-4 border-e-slate-900"></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
