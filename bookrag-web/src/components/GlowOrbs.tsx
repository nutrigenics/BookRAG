import React from 'react';

export default function GlowOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-violet-400/30 rounded-full blur-[100px] animate-float-slow mix-blend-multiply" />
            <div className="absolute top-[20%] right-[-100px] w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-[100px] animate-float-delayed mix-blend-multiply" />
            <div className="absolute bottom-[-100px] left-[20%] w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-[100px] animate-float-reverse mix-blend-multiply" />
        </div>
    );
}
