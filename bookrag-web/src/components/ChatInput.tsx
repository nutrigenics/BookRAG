import React, { useRef, useEffect } from 'react';
import { Send, Mic, Trash2 } from 'lucide-react';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSubmit: () => void;
    loading: boolean;
    messagesLength: number;
    clearChat: () => void;
    translations: {
        placeholder: string;
        send: string;
        clear: string;
        poweredBy: string;
        disclaimer: string;
    };
}

export default function ChatInput({ input, setInput, handleSubmit, loading, messagesLength, clearChat, translations }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
        }
    }, [input]);

    return (
        <div className="flex-none p-3 md:p-3 pb-4 md:pb-8 z-20">
            <div className="max-w-2xl mx-auto w-full">
                <div className="relative flex items-center gap-2 md:gap-3 bg-white rounded-[2rem] shadow-lg px-2 py-1 transition-shadow duration-300 hover:shadow-xl">

                    {/* Mic Button (Left) */}
                    <button className="flex-none p-2 md:p-3 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-full transition-all duration-200 group mb-1" title="Voice Input">
                        <Mic className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Text Input */}
                    <div className="flex-1 min-w-0 flex items-center">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder={translations.placeholder}
                            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none p-0 text-gray-700 placeholder-gray-400 text-[15px] resize-none max-h-32 overflow-y-auto leading-relaxed !outline-non outline-none"
                            disabled={loading}
                            rows={1}
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {messagesLength > 0 && (
                            <button
                                onClick={clearChat}
                                className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-xs font-medium border border-transparent hover:border-red-100 whitespace-nowrap"
                                title={translations.clear}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">{translations.clear}</span>
                            </button>
                        )}


                        <button
                            onClick={() => handleSubmit()}
                            disabled={!input.trim() || loading}
                            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-3 py-2.5 md:px-5 rounded-[1.5rem] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-medium text-sm"
                        >
                            <span className="hidden md:inline">{translations.send}</span>
                            <Send className="w-4 h-4 md:w-3.5 md:h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="text-center mt-3 space-y-1">
                    <p className="text-[11px] text-gray-500 font-medium">
                        {translations.poweredBy} <a href="https://www.lawa.app" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">LawaAI</a>
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                        {translations.disclaimer}
                    </p>
                </div>
            </div>
        </div>
    );
}
