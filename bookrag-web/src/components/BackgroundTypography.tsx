import React from 'react';

interface BackgroundTypographyProps {
    title: string;
    className?: string;
    isArabic?: boolean;
}

export default function BackgroundTypography({ title, className = "", isArabic = false }: BackgroundTypographyProps) {
    // Use outline text style for a modern, subtle look
    return (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0 opacity-20 ${className}`}>
            <div className={`absolute whitespace-nowrap text-[15vw] md:text-[20vw] font-bold leading-none animate-slide-text tracking-tighter ${isArabic ? 'font-arabic' : 'font-sans'}`}>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-current to-transparent" style={{ WebkitTextStroke: "1px currentColor" }}>
                    {title}
                </span>
            </div>

            {/* Duplicate for parallax depth */}
            <div className={`absolute top-[60%] whitespace-nowrap text-[12vw] md:text-[15vw] font-bold leading-none animate-slide-text-slow opacity-40 ${isArabic ? 'font-arabic' : 'font-sans'}`}>
                <span className="text-transparent" style={{ WebkitTextStroke: "1px currentColor" }}>
                    {title}
                </span>
            </div>
        </div>
    );
}
