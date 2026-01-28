import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Mic, Trash2, MicOff, Square } from 'lucide-react';

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

// Add types for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export default function ChatInput({ input, setInput, handleSubmit, loading, messagesLength, clearChat, translations }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const inputRef = useRef(input);

    // Keep inputRef consistent
    useEffect(() => {
        inputRef.current = input;
    }, [input]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onstart = () => setIsListening(true);
                recognition.onend = () => setIsListening(false);

                recognition.onresult = (event: any) => {
                    const transcript = Array.from(event.results)
                        .map((result: any) => result[0])
                        .map((result) => result.transcript)
                        .join('');

                    if (event.results[0].isFinal) {
                        const currentText = inputRef.current;
                        const separator = currentText && !currentText.endsWith(' ') ? ' ' : '';
                        setInput(currentText + separator + transcript);
                    }
                };

                recognitionRef.current = recognition;
            }
        }
    }, [setInput]);

    const toggleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex-none p-3 md:p-3 z-20">
            <div className="max-w-2xl mx-auto w-full">
                <div className="relative flex flex-col items-center gap-2 md:gap-3 rounded-3xl px-2 py-1 border border-[var(--border-light)] bg-white/90 backdrop-blur-3xl transition-all duration-300 outline outline-2 outline-offset-4 outline-[var(--border-light)] focus-within:border-[var(--accent-primary)]/50 focus-within:outline-[var(--accent-primary)]/50 shadow-sm focus-within:shadow-md">

                    {/* Text Input */}
                    <div className="w-full min-w-0 flex items-center p-3">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? "Listening..." : translations.placeholder}
                            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none p-0 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-[15px] resize-none max-h-32 overflow-y-auto leading-relaxed"
                            disabled={loading}
                            rows={1}
                        />
                    </div>

                    <div className="w-full flex items-center justify-between pb-1 px-1">
                        {/* Mic Button (Left) */}
                        <button
                            onClick={toggleVoiceInput}
                            className={`flex-none p-2 rounded-full transition-all duration-300 group relative border border-[var(--border-light)]
                                ${isListening
                                    ? 'text-red-500 bg-red-50 animate-ripple'
                                    : 'text-[var(--text-muted)] hover:text-[var(--accent-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }
                            `}
                            title="Voice Input"
                        >
                            {isListening ? (
                                <MicOff className="w-4 h-4 relative z-10" />
                            ) : (
                                <Mic className="w-4 h-4 group-hover:scale-110 transition-transform relative z-10" />
                            )}
                        </button>


                        {/* Right Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={clearChat}
                                disabled={messagesLength === 0}
                                className="flex items-center gap-2 px-3 py-1.5 text-[var(--text-muted)] hover:text-red-600 bg-[var(--bg-secondary)] hover:bg-red-50 border border-[var(--border-light)] hover:border-red-200 rounded-full transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[var(--text-muted)] disabled:hover:bg-[var(--bg-secondary)] disabled:hover:border-[var(--border-light)]"
                                title={translations.clear}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{translations.clear}</span>
                            </button>

                            <button
                                onClick={() => handleSubmit()}
                                disabled={!input.trim() || loading}
                                className="flex items-center justify-center bg-[var(--accent-primary)] hover:bg-[var(--accent-dark)] text-white w-9 h-9 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                            >
                                {loading ? (
                                    <Square className="w-3 h-3 animate-pulse fill-current" />
                                ) : (
                                    <ArrowUp className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
