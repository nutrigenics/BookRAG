import React, { useEffect, useRef } from 'react';

// Gray shades palette
const GRAY_PALETTE = [
    "#1f2937", // Gray 800
    "#374151", // Gray 700
    "#4b5563", // Gray 600
    "#6b7280", // Gray 500
    "#9ca3af", // Gray 400
    "#d1d5db", // Gray 300
];

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    size: number;
    color: string;
    // Specific stored positions for static shapes
    cloudR: number;
    cloudAngle: number;
    clusterR: number;
    clusterAngle: number;
}

export default function ParticleRing() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Initialize particles with basic properties
        const particleCount = 4000;
        const particles: Particle[] = [];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        for (let i = 0; i < particleCount; i++) {
            // Pre-calculate Cloud Shape (Powder effect)
            // Gaussian-like distribution: heavily biased to center
            const cloudAngle = Math.random() * Math.PI * 2;
            const cloudR = (Math.random() ** 2.5) * 160;

            // Pre-calculate Cluster Shape (Binary Star)
            // 50/50 split left/right
            const clusterR = Math.random() * 50; // tight clusters
            const clusterAngle = Math.random() * Math.PI * 2;

            particles.push({
                x: centerX,
                y: centerY,
                baseX: centerX,
                baseY: centerY,
                size: Math.random() * 2 + 0.5,
                color: GRAY_PALETTE[Math.floor(Math.random() * GRAY_PALETTE.length)],
                cloudR,
                cloudAngle,
                clusterR,
                clusterAngle
            });
        }

        // Helper: Project 3D point to 2D with perspective
        const project3D = (x: number, y: number, z: number, scale: number = 1) => {
            const fov = 300;
            const distance = 400; // Camera distance
            const factor = fov / (distance + z);
            return {
                x: centerX + x * factor * scale,
                y: centerY + y * factor * scale,
                scale: factor
            };
        };

        // Animation state
        let time = 0;
        let mode = 0;
        let currentShape = 0;
        let lastShapeChange = 0;
        let lastModeChange = 0;

        let animationFrameId: number;

        const render = (timestamp: number) => {
            time++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Change SHAPE randomly every ~6 seconds
            // Only 3 shapes: 0 (Cloud), 1 (Clustered Ring), 2 (Mobius)
            if (timestamp - lastShapeChange > 6000) {
                currentShape = (currentShape + 1) % 3;
                lastShapeChange = timestamp;
            }

            // Change BEHAVIOR MODE randomly every ~4 seconds
            if (timestamp - lastModeChange > 4000) {
                mode = Math.floor(Math.random() * 3);
                lastModeChange = timestamp;
            }

            particles.forEach((p, i) => {
                let tx = 0;
                let ty = 0;
                let scale = 1;

                // --- CALCULATE DYNAMIC TARGET POSITION (SHAPE ANIMATION) ---

                // Shape 0: Central Cloud (Powder Effect) - UNCHANGED
                if (currentShape === 0) {
                    const rotation = time * 0.002;
                    const r = p.cloudR;
                    const angle = p.cloudAngle + rotation;

                    tx = centerX + Math.cos(angle) * r;
                    ty = centerY + Math.sin(angle) * r;
                }

                // Shape 1: Clustered Ring (Scattered, No DNA Helix) - NEW
                else if (currentShape === 1) {
                    const rotation = time * 0.005;
                    // Distribute particles to form clusters along the ring
                    // We use the particle index to determine cluster position
                    const numClusters = 5;
                    // Base angle identifies the cluster center
                    const clusterIndex = i % numClusters;
                    const clusterAngleBase = (clusterIndex / numClusters) * Math.PI * 2;

                    // Add randomness within the cluster
                    const randomOffset = (p.clusterAngle % (Math.PI / 2)) - (Math.PI / 4);

                    // Combine rotation, cluster base, and spread
                    const angle = clusterAngleBase + randomOffset + rotation + (i * 0.0005);

                    // Ring Radius with scatter
                    // Normal scatter (width of the ring)
                    const ringRadius = 130;
                    const scatter = p.clusterR * 0.8; // Use existing random property
                    const r = ringRadius + (Math.random() - 0.5) * 20 + scatter;

                    const x3 = Math.cos(angle) * r;
                    const y3 = Math.sin(angle) * r;
                    // Flatter ring, less vertical wave
                    const z3 = (Math.random() - 0.5) * 40;

                    // Tilt the whole ring slightly for 3D effect
                    const tiltX = 0.4;
                    const tiltY = 0.2;

                    const yr = y3 * Math.cos(tiltX) - z3 * Math.sin(tiltX);
                    const zr = y3 * Math.sin(tiltX) + z3 * Math.cos(tiltX);
                    const xr = x3 * Math.cos(tiltY) - zr * Math.sin(tiltY);
                    const zrr = x3 * Math.sin(tiltY) + zr * Math.cos(tiltY);

                    const proj = project3D(xr, yr, zrr);
                    tx = proj.x;
                    ty = proj.y;
                    scale = proj.scale;
                }

                // Shape 2: Mobius Strip (3D Rotating) - WAS Shape 4
                else if (currentShape === 2) {
                    const t = (i / particleCount) * Math.PI * 2;
                    const u = t;
                    const v = (i % 20) / 10 - 1; // Strip width -1 to 1

                    const radius = 90;

                    // Mobius Parametric Eq
                    const x3 = (1 + (v / 2) * Math.cos(u / 2)) * Math.cos(u) * radius;
                    const y3 = (1 + (v / 2) * Math.cos(u / 2)) * Math.sin(u) * radius;
                    const z3 = (v / 2) * Math.sin(u / 2) * radius;

                    // Rotate 3D Object
                    const rotX = time * 0.01;
                    const rotY = time * 0.013;

                    // Simple rotation matrix application
                    // Rot Y
                    const xz = x3 * Math.cos(rotY) - z3 * Math.sin(rotY);
                    const zz = x3 * Math.sin(rotY) + z3 * Math.cos(rotY);
                    const yz = y3;

                    // Rot X
                    const yFinal = yz * Math.cos(rotX) - zz * Math.sin(rotX);
                    const zFinal = yz * Math.sin(rotX) + zz * Math.cos(rotX);
                    const xFinal = xz;

                    const proj = project3D(xFinal, yFinal, zFinal);
                    tx = proj.x;
                    ty = proj.y;
                    scale = proj.scale;
                }

                p.baseX = tx;
                p.baseY = ty;

                let dx = 0;
                let dy = 0;

                // --- Behavior Modes applied ON TOP of structure ---
                // Mode 0: Jitter
                if (mode === 0) {
                    dx = Math.sin(time * 0.01 + p.x * 0.01) * 2;
                    dy = Math.cos(time * 0.01 + p.y * 0.01) * 2;
                }
                // Mode 1: Swirl (local)
                else if (mode === 1) {
                    dx = Math.cos(time * 0.02 + p.y * 0.01) * 3;
                    dy = Math.sin(time * 0.02 + p.x * 0.01) * 3;
                }
                // Mode 2: Pulse
                else if (mode === 2) {
                    const distFromCenter = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
                    const pulse = Math.sin(time * 0.05) * 5 * (distFromCenter / 100);
                    const angle = Math.atan2(p.y - centerY, p.x - centerX);
                    dx = Math.cos(angle) * pulse;
                    dy = Math.sin(angle) * pulse;
                }

                // Move smoothed towards structural baseline (Morphing)
                // We use a slower lerp to make the morphing visible and fluid
                p.x += (p.baseX + dx - p.x) * 0.05; // Slightly faster lerp for 3D responsiveness
                p.y += (p.baseY + dy - p.y) * 0.05;

                ctx.beginPath();
                // Scale particle size by depth (perspective)
                ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div
            className="relative flex items-center justify-center pointer-events-none flex-none"
            style={{ width: '400px', height: '400px' }}
        >
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="block"
                style={{ width: '400px', height: '400px' }}
            />
        </div>
    );
}
