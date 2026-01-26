import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, Clipboard, Bot, User, FileText } from 'lucide-react';
import logo from '../assets/logo-square.svg';

// Dynamically import PdfPreview with SSR disabled to prevent DOMMatrix errors
const PdfPreview = dynamic(() => import('./PdfPreview'), {
    ssr: false,
    loading: () => <div className="mt-4 text-xs text-gray-400">Loading document preview...</div>
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

export default function ChatMessage({ message, isStreaming, bookId = 'geografia', userColor = '#0d9488', onReferenceClick, translations }: ChatMessageProps) {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 1. Remove "References" or "Bibliography" section from text if we have dynamic refs
    // This looks for "References" at start of a line near the end of the message
    let displayContent = message.content;
    if (message.references && message.references.length > 0) {
        // Updated regex to include Arabic terms
        const refRegex = /\n+(?:###\s*)?(?:References|Bibliography|Sources|المصادر|المراجع)(?:[:\s])[\s\S]*$/i;
        displayContent = displayContent.replace(refRegex, '');
    }

    // 2. Pre-process content to replace [Page X] with buttons
    const processedContent = displayContent.replace(
        /\[[^\]]*Page\s*(\d+)[^\]]*\]/gi,
        (match, pageNum) => `[Page ${pageNum}](#page=${pageNum})`
    );

    const openPdf = (page: string) => {
        const pageNum = parseInt(page, 10) || 1;
        if (onReferenceClick) {
            onReferenceClick(bookId, pageNum);
        } else {
            // Fallback to new tab if no callback provided
            const asset = BOOK_ASSETS[bookId] || BOOK_ASSETS['geografia'];
            window.open(`${asset.pdf}#page=${page}`, '_blank');
        }
    };

    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-center'} animate-fade-in`}>
            {isUser ? (
                // User Message
                <div
                    className="max-w-[85%] md:max-w-[70%] text-white rounded-2xl shadow-md px-4 py-3 relative overflow-hidden group"
                    style={{ backgroundColor: userColor }}
                >
                    <div className="relative z-10 text-[15px] leading-relaxed font-medium">
                        {message.content}
                    </div>
                </div>
            ) : (
                // AI Message
                <div className="w-full max-w-4xl flex gap-3 md:gap-5">
                    {/* Avatar Column */}
                    <div className="flex-shrink-0 pt-1">
                        <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-0.5">
                            <Image src={logo} alt="Bot" width={28} height={28} className="object-contain" />
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                        <div className="group/message bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">

                            {/* Card Header (Actions) */}
                            <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100 bg-gray-50/50">
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Bot className="w-3 h-3" />
                                    LawaAI Agent
                                </span>
                                <button
                                    onClick={() => handleCopy(message.content)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover/message:opacity-100"
                                    title="Copy response"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Clipboard className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 md:p-8 pt-6 pb-8 text-gray-800 text-[16px] leading-8">
                                <div className="prose prose-base max-w-none 
                                    prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-8 prose-headings:mb-4
                                    prose-p:leading-8 prose-p:mb-5 prose-p:text-gray-700
                                    prose-a:text-gray-700 prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:decoration-2 hover:prose-a:decoration-gray-400
                                    prose-strong:font-bold prose-strong:text-gray-900 
                                    prose-ul:list-disc prose-ul:pl-6 prose-ul:my-6 prose-ul:space-y-2
                                    prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-6 prose-ol:space-y-2
                                    prose-li:marker:text-gray-400 prose-li:text-gray-700
                                    
                                    prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:border prose-code:border-gray-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[0.9em] before:prose-code:content-none after:prose-code:content-none
                                    prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:pl-4 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-gray-600
                                    
                                    /* Fix for first/last element spacing */
                                    [&>*:first-child]:mt-0
                                    [&>*:last-child]:mb-0
                                ">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a({ node, className, children, href, ...props }: any) {
                                                if (href && href.startsWith('#page=')) {
                                                    const pageNum = href.split('=')[1];
                                                    return (
                                                        <button
                                                            onClick={() => openPdf(pageNum)}
                                                            className="inline-flex items-center gap-1.5 mx-1 px-2.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold transition-all border border-gray-200 hover:border-gray-300 cursor-pointer align-baseline transform hover:scale-[1.02] active:scale-95 shadow-sm"
                                                            title={`${translations.page} ${pageNum}`}
                                                        >
                                                            <FileText className="w-3 h-3 opacity-70" />
                                                            {translations.page} {pageNum}
                                                        </button>
                                                    );
                                                }
                                                return <a href={href} className={className} {...props}>{children}</a>;
                                            },
                                            ul({ node, className, children, ...props }: any) {
                                                return <ul className="list-disc pl-6 my-4 space-y-2 text-gray-700" {...props}>{children}</ul>
                                            },
                                            ol({ node, className, children, ...props }: any) {
                                                return <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-700" {...props}>{children}</ol>
                                            },
                                            li({ node, className, children, ...props }: any) {
                                                return <li className="pl-1 marker:text-gray-300" {...props}>{children}</li>
                                            },
                                            code({ node, inline, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                const codeString = String(children).replace(/\n$/, '');

                                                return !inline && match ? (
                                                    <div className="rounded-xl overflow-hidden my-6 border border-gray-200/80 shadow-sm group/code bg-[#1e1e1e]">
                                                        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700/50">
                                                            <span className="text-xs font-mono text-gray-400 lowercase flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-red-500 opacity-70"></span>
                                                                <span className="w-2 h-2 rounded-full bg-yellow-500 opacity-70"></span>
                                                                <span className="w-2 h-2 rounded-full bg-green-500 opacity-70"></span>
                                                                <span className="ml-2">{match[1]}</span>
                                                            </span>
                                                            <CopyToClipboardButton text={codeString} />
                                                        </div>
                                                        <div className="p-1">
                                                            <SyntaxHighlighter
                                                                {...props}
                                                                style={vscDarkPlus}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                customStyle={{ margin: 0, borderRadius: 0, fontSize: '14px', lineHeight: '1.5', background: 'transparent' }}
                                                            >
                                                                {codeString}
                                                            </SyntaxHighlighter>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {processedContent + (isStreaming ? '▍' : '')}
                                    </ReactMarkdown>
                                </div>

                                {/* References Section - Compact Chips */}
                                {!isStreaming && message.references && message.references.filter(r => r.page !== 'Unknown' && r.page).length > 0 && (
                                    <div className="mt-6 pt-5 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{translations.sources}</span>
                                            <span className="text-[10px] text-gray-400">({message.references.length})</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {message.references.map((ref, idx) => {
                                                const pageNum = ref.page || '1';

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => openPdf(ref.page)}
                                                        className="group inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 rounded-lg transition-all duration-200 cursor-pointer"
                                                    >
                                                        <FileText className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
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
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            {isCopied ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
        </button>
    );
}
