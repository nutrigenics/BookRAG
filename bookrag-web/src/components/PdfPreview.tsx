import React from 'react';
import Image from 'next/image';
import { FileText, ExternalLink } from 'lucide-react';

interface PdfPreviewProps {
    references: string[];
    bookId?: string;
}

const BOOK_ASSETS: Record<string, { pdf: string; cover: string }> = {
    geografia: { pdf: "/La_Geografia.pdf", cover: "/La_Geografia.png" },
    tractatus: { pdf: "/tractatus.pdf", cover: "/tractatus.png" },
    tabulae: { pdf: "/Tabulue_Rudolphinae.pdf", cover: "/Tabulue_Rudolphinae.png" }
};

export default function PdfPreview({ references, bookId = 'geografia' }: PdfPreviewProps) {
    if (!references.length) return null;

    const assets = BOOK_ASSETS[bookId] || BOOK_ASSETS['geografia'];

    // Deduplicate references
    const uniqueRefs = Array.from(new Set(references));

    return (
        <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4 px-1">
                <div className="p-1.5 bg-violet-100 rounded-lg">
                    <FileText className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-sm font-bold text-gray-800 tracking-tight">
                    Reference Pages from Book
                </span>
                <span className="text-xs font-medium text-gray-400 ml-auto">
                    {uniqueRefs.length} pages found
                </span>
            </div>

            {/* Horizontal Scroll Container with Fade Masks */}
            <div className="relative group/container">
                <div className="flex overflow-x-auto pb-6 pt-2 gap-4 px-1 scrollbar-hide snap-x snap-mandatory">
                    {uniqueRefs.map((ref, i) => (
                        <div key={i} className="flex-none snap-center group perspective-1000">
                            <a
                                href={`${assets.pdf}#page=${ref}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative w-[180px] aspect-[1/1.4] transition-all duration-500 ease-out transform group-hover:-translate-y-2 group-hover:rotate-1"
                            >
                                {/* Card Container */}
                                <div className="absolute inset-0 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden group-hover:shadow-2xl group-hover:shadow-violet-500/20 group-hover:border-violet-200 transition-all duration-300">

                                    {/* Static Book Cover Image */}
                                    <div className="w-full h-full relative bg-gray-50">
                                        <Image
                                            src={assets.cover}
                                            alt={`Page ${ref} Preview`}
                                            fill
                                            className="object-cover"
                                            sizes="180px"
                                        />
                                    </div>

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                                    {/* Bottom Info Label */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between z-30">
                                        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-700">Page {ref}</span>
                                        </div>
                                        <div className="w-6 h-6 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-violet-600">
                                            <ExternalLink className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Badge (Always Visible) */}
                                <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-30 group-hover:bg-violet-600 transition-colors">
                                    {i + 1}
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
