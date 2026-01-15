import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';

interface PdfViewerPanelProps {
    bookId: string;
    page: number;
    onClose: () => void;
}

const BOOK_ASSETS: Record<string, { pdf: string; title: string }> = {
    geografia: { pdf: "/La_Geografia.pdf", title: "La Geografia" },
    tractatus: { pdf: "/tractatus.pdf", title: "Tractatus" },
    tabulae: { pdf: "/Tabulue_Rudolphinae.pdf", title: "Tabulae Rudolphinae" }
};

export default function PdfViewerPanel({ bookId, page, onClose }: PdfViewerPanelProps) {
    const [currentPage, setCurrentPage] = useState(page);
    const [loading, setLoading] = useState(true);

    const assets = BOOK_ASSETS[bookId] || BOOK_ASSETS['geografia'];
    // Hide sidebar (navpanes=0), toolbar minimized (toolbar=0), and go to specific page
    const pdfUrl = `${assets.pdf}#page=${currentPage}&navpanes=0&scrollbar=0&view=FitH`;

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToNextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    const openInNewTab = () => {
        window.open(pdfUrl, '_blank');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[200] flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{assets.title}</h3>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Page {currentPage}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={openInNewTab}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Open in new tab"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* PDF Content via iframe */}
                <div className="flex-1 relative bg-gray-100">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    )}
                    <iframe
                        key={currentPage} // Force reload on page change
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        onLoad={() => setLoading(false)}
                        title={`${assets.title} - Page ${currentPage}`}
                    />
                </div>

                {/* Footer / Navigation */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-white">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage <= 1}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    <span className="text-xs text-gray-400">
                        Viewing page {currentPage}
                    </span>

                    <button
                        onClick={goToNextPage}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    );
}
