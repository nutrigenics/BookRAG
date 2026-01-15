import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import logo from '../assets/logo-square.svg';

export default function ThinkingBubble() {
    const [step, setStep] = useState(0);

    const steps = [
        "Analyzing request...",
        "Consulting library...",
        "Formulating response..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % steps.length);
        }, 1500);
        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="w-full flex justify-center py-4 text-left animate-fade-in">
            <div className="w-full max-w-4xl flex gap-3 md:gap-5">
                {/* Avatar Column */}
                <div className="flex-shrink-0 pt-1">
                    <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-0.5">
                        <Image src={logo} alt="Bot" width={28} height={28} className="object-contain" />
                    </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 bg-gray-50/80 backdrop-blur-sm border border-gray-100 rounded-2xl px-5 py-3 w-fit shadow-sm">

                        {/* Animated Icon */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-violet-400/20 rounded-full animate-ping"></div>
                            <Sparkles className="w-4 h-4 text-violet-600 relative z-10" />
                        </div>

                        {/* Cycling Text */}
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-600 animate-pulse">
                                {steps[step]}
                            </span>
                            {/* Subtle Progress Bar */}
                            <div className="h-0.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-violet-400/50 w-full animate-[loading_2s_ease-in-out_infinite] origin-left scale-x-0"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
