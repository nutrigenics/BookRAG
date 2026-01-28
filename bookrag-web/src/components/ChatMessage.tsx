import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, Clipboard, Bot, User, FileText, BookOpen } from 'lucide-react';
import logo from '../assets/logo-square.svg';

// Dynamically import PdfPreview with SSR disabled to prevent DOMMatrix errors
const PdfPreview = dynamic(() => import('./PdfPreview'), {
    ssr: false,
    loading: () => <div className="mt-4 text-xs text-[var(--text-muted)]">Loading document preview...</div>
});

import { Message, Reference } from '../types';

interface ChatMessageProps {
    message: Message;
    isStreaming?: boolean;
    bookId?: string;
    userColor?: string;
    onReferenceClick?: (bookId: string, page: number) => void;
    translations: {
        sources: string;
        page: string;
    };
}

const BOOK_ASSETS: Record<string, { pdf: string }> = {
    geografia: { pdf: "/La_Geografia.pdf" },
    tractatus: { pdf: "/tractatus.pdf" },
    tabulae: { pdf: "/Tabulue_Rudolphinae.pdf" }
};

export default function ChatMessage({ message, isStreaming, bookId = 'geografia', onReferenceClick, translations }: ChatMessageProps) {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 1. Remove "References" or "Bibliography" section to avoid duplication
    let displayContent = message.content;
    if (message.references && message.references.length > 0) {
        const refRegex = /\n+(?:###\s*)?(?:References|Bibliography|Sources|المصادر|المراجع)(?:[:\s])[\s\S]*$/i;
        displayContent = displayContent.replace(refRegex, '');
    }

    // 2. Pre-process content to transform [Page N] into clickable links
    const processedContent = displayContent.replace(
        /\[[^\]]*Page\s*(\d+)[^\]]*\]/gi,
        (match, pageNum) => `[Page ${pageNum}](#page=${pageNum})`
    );

    const openPdf = (page: string) => {
        const pageNum = parseInt(page, 10) || 1;
        if (onReferenceClick) {
            onReferenceClick(bookId, pageNum);
        } else {
            const asset = BOOK_ASSETS[bookId] || BOOK_ASSETS['geografia'];
            window.open(`${asset.pdf}#page=${page}`, '_blank');
        }
    };

    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-center'} animate-fade-in group/message`}>
            {isUser ? (
                // User Message - Modern Glass Bubble
                <div className="max-w-[85%] md:max-w-[70%] text-white rounded-2xl rounded-tr-sm shadow-sm hover:shadow-md transition-shadow px-5 py-3 relative overflow-hidden bg-[var(--accent-primary)] backdrop-blur-md">
                    <div className="relative z-10 text-[15px] leading-relaxed font-medium">
                        {message.content}
                    </div>
                </div>
            ) : (
                // AI Message - Clean & Integrated
                <div className="w-full max-w-4xl flex justify-center">
                    <div className="w-full group/message bg-white/40 backdrop-blur-sm border border-[var(--border-light)] rounded-3xl p-6 md:p-8 hover:bg-white/60 transition-colors duration-300">

                        {/* Header: Logo + Title + Actions */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-300">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center p-0.5 bg-white/50 border border-white/50 shadow-sm">
                                    <Image src={logo} alt="Bot" width={24} height={24} className="object-contain" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 tracking-wide">
                                    LawaAI Agent
                                </span>
                            </div>

                            <button
                                onClick={() => handleCopy(message.content)}
                                className="p-1.5 rounded-full bg-white/50 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white transition-all shadow-sm opacity-0 group-hover/message:opacity-100"
                                title="Copy response"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Clipboard className="w-3.5 h-3.5" />}
                            </button>
                        </div>


                        <div className="prose prose-slate max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    hr: ({ node, ...props }) => <hr className="my-6 border-slate-300" {...props} />,
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <div className="relative group/code my-4 rounded-xl overflow-hidden border border-slate-200/50 shadow-sm">
                                                <div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleCopy(String(children).replace(/\n$/, ''))}
                                                        className="p-1.5 rounded-lg bg-white/80 text-slate-500 hover:text-[var(--accent-primary)] transition-colors shadow-sm backdrop-blur-sm"
                                                        title="Copy code"
                                                    >
                                                        {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <div className="absolute left-4 top-2 z-10 pointer-events-none">
                                                    <span className="text-xs font-mono text-slate-400 bg-slate-900/5 px-2 py-0.5 rounded">{match[1]}</span>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.9em', paddingTop: '2rem' }}
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className={`${className} px-1.5 py-0.5 rounded-md bg-slate-100/80 text-[var(--accent-primary)] font-mono text-sm border border-slate-200/50`} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-4 font-heading" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-slate-900 mt-5 mb-3 font-heading" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2 font-heading" {...props} />,
                                    p: ({ node, ...props }) => <p className="text-slate-700 leading-relaxed mb-4 text-[15px]" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 text-slate-700 space-y-1" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 text-slate-700 space-y-1" {...props} />,
                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                    a: ({ node, ...props }) => (
                                        <a
                                            className="text-[var(--accent-primary)] hover:underline font-medium transition-colors cursor-pointer decoration-2 decoration-[var(--accent-light)] underline-offset-2"
                                            {...props}
                                        />
                                    ),
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote className="border-l-4 border-[var(--accent-light)] pl-4 italic text-slate-600 my-4 bg-slate-50/30 py-2 rounded-r-lg" {...props} />
                                    ),
                                }}
                            >
                                {processedContent}
                            </ReactMarkdown>

                            {/* References / Bibliography Section */}
                            {message.references && message.references.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-300">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] mb-4 uppercase tracking-wider">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        {translations.sources}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {message.references.map((ref, idx) => {
                                            const pageNum = ref.page || '1';
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => openPdf(ref.page)}
                                                    className="group inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 bg-white border border-slate-200 hover:border-[var(--accent-light)] rounded-full transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center group-hover:bg-[var(--accent-primary)] transition-colors">
                                                        <FileText className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700 group-hover:text-[var(--text-primary)] transition-colors">
                                                        {translations.page} {pageNum}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CopyToClipboardButton({ text }: { text: string }) {
    const [isCopied, setIsCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    return (
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors">
            {isCopied ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
        </button>
    );
}
