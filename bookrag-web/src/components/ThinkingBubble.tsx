import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Check, Loader2, Circle } from 'lucide-react';
import logo from '../assets/logo-square.svg';

export default function ThinkingBubble() {
    const [step, setStep] = useState(0);

    const steps = [
        "Analyzing your request...",
        "Consulting knowledge base...",
        "Generating comprehensive response..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
<<<<<<< Updated upstream
            setStep((prev) => (prev + 1) % (steps.length + 1)); // +1 to allow a "finished" state moment if needed, or just cycle
=======
            setStep((prev) => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                return prev; // Stay on the last step
            });
>>>>>>> Stashed changes
        }, 2500);
        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="w-full flex justify-center py-4 animate-fade-in text-left">
            <div className="w-full max-w-4xl group/message bg-white/40 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-6 md:p-8 transition-colors duration-300">

                {/* Header: Logo + Title */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center p-0.5 bg-white/50 border border-white/50 shadow-sm">
                        <Image src={logo} alt="Bot" width={24} height={24} className="object-contain" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 tracking-wide">
                        LawaAI Agent
                    </span>
                </div>

                {/* Multi-step Loading Indicator */}
                <div className="space-y-4 max-w-lg">
                    {steps.map((label, idx) => {
                        const isActive = idx === step;
                        const isCompleted = idx < step;

                        return (
                            <div key={idx} className="flex items-center gap-4 transition-all duration-300">
                                {/* Status Icon */}
                                <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300
                                    ${isCompleted ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' :
                                        isActive ? 'bg-white border-[var(--accent-primary)] shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                                            'bg-transparent border-slate-300'}
                                `}>
                                    {isCompleted ? (
                                        <Check className="w-3.5 h-3.5 text-white animate-fade-in" />
                                    ) : isActive ? (
                                        <Loader2 className="w-3.5 h-3.5 text-[var(--accent-primary)] animate-spin" />
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    )}
                                </div>

                                {/* Text Label */}
                                <span className={`
                                    text-sm font-medium transition-colors duration-300
                                    ${isCompleted ? 'text-slate-500' :
                                        isActive ? 'text-[var(--text-primary)] font-semibold' :
                                            'text-slate-400'}
                                `}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
