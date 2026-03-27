import { useEffect, useRef } from 'react';

export default function DojoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
      color: string;
      type: 'spark' | 'belt' | 'energy';
    }

    function resize() {
      canvas!.width = canvas!.offsetWidth * window.devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    resize();
    window.addEventListener('resize', resize);

    function spawnParticle() {
      const types: Particle['type'][] = ['spark', 'belt', 'energy'];
      const type = types[Math.floor(Math.random() * types.length)];
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;

      const colors: Record<Particle['type'], string> = {
        spark: `rgba(220, 38, 38, ${0.2 + Math.random() * 0.4})`,
        belt: `rgba(212, 160, 23, ${0.15 + Math.random() * 0.3})`,
        energy: `rgba(255, 255, 255, ${0.05 + Math.random() * 0.1})`,
      };

      particles.push({
        x: Math.random() * w,
        y: h + 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(0.3 + Math.random() * 1.2),
        size: type === 'energy' ? 1 + Math.random() * 3 : 1 + Math.random() * 2,
        alpha: 1,
        decay: 0.002 + Math.random() * 0.005,
        color: colors[type],
        type,
      });
    }

    function drawStrikeLine(ctx: CanvasRenderingContext2D, w: number) {
      if (Math.random() > 0.995) {
        const y = Math.random() * canvas!.offsetHeight;
        const gradient = ctx.createLinearGradient(0, y, w, y);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.3, 'rgba(220, 38, 38, 0.15)');
        gradient.addColorStop(0.5, 'rgba(220, 38, 38, 0.3)');
        gradient.addColorStop(0.7, 'rgba(220, 38, 38, 0.15)');
        gradient.addColorStop(1, 'transparent');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    function animate() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);

      // Spawn new particles
      if (particles.length < 40 && Math.random() > 0.92) {
        spawnParticle();
      }

      // Draw & update particles
      particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) return false;

        ctx!.globalAlpha = p.alpha;
        ctx!.fillStyle = p.color;

        if (p.type === 'belt') {
          // Belt fragments - elongated
          ctx!.fillRect(p.x, p.y, p.size * 3, p.size * 0.5);
        } else {
          // Sparks and energy - circular
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx!.fill();
        }

        ctx!.globalAlpha = 1;
        return true;
      });

      // Occasional strike lines
      drawStrikeLine(ctx!, w);

      animId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
