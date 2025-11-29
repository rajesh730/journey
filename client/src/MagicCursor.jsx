import React, { useEffect, useRef } from 'react';

const MagicCursor = () => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const bubbles = useRef([]); // Store active bubble animations
    const cursor = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            cursor.current = { x: e.clientX, y: e.clientY };
            createParticle(e.clientX, e.clientY);
        };

        const handleClick = (e) => {
            // Create a "Glow Love Bubble" on click
            createBubble(e.clientX, e.clientY);
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);
        resizeCanvas();

        const createParticle = (x, y) => {
            const isNight = document.body.classList.contains('night-mode');
            const colors = isNight
                ? ['#a78bfa', '#c4b5fd', '#ddd6fe', '#e9d5ff', '#fff'] // Purple/violet shades for night
                : ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#fde047', '#fff']; // Purple + sparkle yellow

            // Create 2-3 particles per mouse move for denser trail
            const particleCount = Math.random() > 0.5 ? 2 : 3;
            for (let i = 0; i < particleCount; i++) {
                const particle = {
                    x: x + (Math.random() - 0.5) * 10,
                    y: y + (Math.random() - 0.5) * 10,
                    size: Math.random() * 5 + 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    speedX: Math.random() * 3 - 1.5,
                    speedY: Math.random() * 3 - 1.5,
                    life: 1,
                    decay: Math.random() * 0.015 + 0.01,
                    shape: Math.random() > 0.6 ? 'star' : 'circle' // 40% stars, 60% circles
                };
                particles.current.push(particle);
            }
        };

        const createBubble = (x, y) => {
            const isNight = document.body.classList.contains('night-mode');
            bubbles.current.push({
                x,
                y,
                size: 10,
                maxSize: 50,
                life: 1.0,
                color: isNight ? '#a78bfa' : '#a855f7', // Purple shades
                glowColor: isNight ? '#7c3aed' : '#9333ea', // Purple glow
                decay: 0.02
            });
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Particles
            particles.current.forEach((particle, index) => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                particle.life -= particle.decay;
                particle.size *= 0.95;

                if (particle.life <= 0 || particle.size <= 0.1) {
                    particles.current.splice(index, 1);
                } else {
                    ctx.save();
                    ctx.globalAlpha = particle.life;

                    // Add glow effect
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = particle.color;

                    if (particle.shape === 'star') {
                        // Draw star shape
                        ctx.translate(particle.x, particle.y);
                        ctx.beginPath();
                        for (let i = 0; i < 5; i++) {
                            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                            const x = Math.cos(angle) * particle.size;
                            const y = Math.sin(angle) * particle.size;
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.closePath();
                        ctx.fillStyle = particle.color;
                        ctx.fill();
                    } else {
                        // Draw circle
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                        ctx.fillStyle = particle.color;
                        ctx.fill();
                    }

                    ctx.restore();
                }
            });

            // Draw Bubbles (Love Shape with Glow)
            bubbles.current.forEach((b, index) => {
                b.size += (b.maxSize - b.size) * 0.1; // Grow effect
                b.life -= b.decay;
                b.y -= 1; // Float up

                if (b.life <= 0) {
                    bubbles.current.splice(index, 1);
                } else {
                    ctx.save();
                    ctx.translate(b.x, b.y);

                    // Glow effect
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = b.glowColor;

                    // Draw Heart Shape
                    ctx.beginPath();
                    const topCurveHeight = b.size * 0.3;
                    ctx.moveTo(0, topCurveHeight);
                    // top left curve
                    ctx.bezierCurveTo(
                        0, 0,
                        -b.size / 2, 0,
                        -b.size / 2, topCurveHeight
                    );
                    // bottom left curve
                    ctx.bezierCurveTo(
                        -b.size / 2, (b.size + topCurveHeight) / 2,
                        0, (b.size + topCurveHeight) / 2,
                        0, b.size
                    );
                    // bottom right curve
                    ctx.bezierCurveTo(
                        0, (b.size + topCurveHeight) / 2,
                        b.size / 2, (b.size + topCurveHeight) / 2,
                        b.size / 2, topCurveHeight
                    );
                    // top right curve
                    ctx.bezierCurveTo(
                        b.size / 2, 0,
                        0, 0,
                        0, topCurveHeight
                    );
                    ctx.closePath();

                    ctx.fillStyle = b.color;
                    ctx.globalAlpha = b.life * 0.6; // Semi-transparent bubble
                    ctx.fill();

                    // Stroke for bubble edge
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = b.life;
                    ctx.stroke();

                    ctx.restore();
                }
            });

            ctx.globalAlpha = 1;
            animationFrameId = requestAnimationFrame(drawParticles);
        };

        drawParticles();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleClick);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default MagicCursor;
