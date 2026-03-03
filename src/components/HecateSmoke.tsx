import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  decay: number;
  color: string;
}

export const HecateSmoke: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    const maxParticles = 35; 

    // Deep ember and ash hex variants to match your Tailwind accent
    const smokeColors = ['255, 78, 0', '204, 62, 0', '15, 5, 2'];

    const resize = () => {
      canvas.width = canvas.parentElement!.offsetWidth;
      canvas.height = canvas.parentElement!.offsetHeight;
    };
    
    // Bind resize to window but compute based on parent element
    window.addEventListener('resize', resize);
    resize();

    const createParticle = (): Particle => {
      // Emit from the lower center of the canvas
      const spawnY = canvas.height + 20;
      const spawnX = (canvas.width / 2) + (Math.random() * 200 - 100);

      return {
        x: spawnX,
        y: spawnY,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 1.2 + 0.3),
        radius: Math.random() * 15 + 10,
        maxRadius: Math.random() * 80 + 60,
        alpha: Math.random() * 0.3 + 0.1,
        decay: Math.random() * 0.003 + 0.001,
        color: smokeColors[Math.floor(Math.random() * smokeColors.length)]
      };
    };

    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
      particles[i].y -= Math.random() * canvas.height; // Distribute initial load
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen';

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.radius < p.maxRadius) p.radius += 0.2;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          gradient.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
          gradient.addColorStop(1, `rgba(${p.color}, 0)`);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        } else {
          particles[index] = createParticle();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70 mix-blend-screen"
    />
  );
};
