import React, { useEffect, useRef } from 'react';

export default function StarField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        const stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];
        const count = 200;

        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5,
                alpha: Math.random(),
                speed: Math.random() * 0.2 + 0.1
            });
        }

        let animationId: number;
        let time = 0;

        const render = () => {
            time++;
            ctx.clearRect(0, 0, width, height);

            // Draw Grid
            ctx.strokeStyle = 'rgba(217, 119, 6, 0.1)';
            ctx.lineWidth = 1;

            // Moving Grid effect
            const gridSize = 50;
            const offset = (time * 0.5) % gridSize;

            for (let x = 0; x < width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            ctx.beginPath();
            for (let y = offset; y < height; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();


            // Draw Stars
            stars.forEach(star => {
                star.y -= star.speed;
                if (star.y < 0) star.y = height;

                // Twinkle
                const twinkle = Math.sin(time * 0.05 + star.x) * 0.5 + 0.5;

                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`;
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(render);
        }

        render();

        const handleResize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-60 mix-blend-screen"
        />
    );
}
