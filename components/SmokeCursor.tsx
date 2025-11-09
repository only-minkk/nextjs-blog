"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

const MAX_PARTICLES = 50;
const PARTICLE_LIFETIME = 800;
const PARTICLE_SIZE = 3;
const PARTICLE_SPEED = 0.3;

export default function ParticleCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const isDarkMode = () => {
      return document.documentElement.classList.contains("dark");
    };

    const getColors = () => {
      if (isDarkMode()) {
        return {
          primary: "rgba(96, 165, 250, 0.8)", // 파란색
          secondary: "rgba(147, 197, 253, 0.6)",
          accent: "rgba(59, 130, 246, 0.4)",
        };
      }
      return {
        primary: "rgba(59, 130, 246, 0.6)", // 파란색
        secondary: "rgba(96, 165, 250, 0.5)",
        accent: "rgba(147, 197, 253, 0.3)",
      };
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);
    };

    resize();

    const createParticle = (x: number, y: number): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = PARTICLE_SPEED * (0.5 + Math.random() * 0.5);
      const colors = getColors();
      const colorOptions = [colors.primary, colors.secondary, colors.accent];

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: PARTICLE_LIFETIME * (0.8 + Math.random() * 0.4),
        size: PARTICLE_SIZE * (0.8 + Math.random() * 0.4),
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      };
    };

    const handlePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };

      // 마우스 위치에 파티클 추가
      if (particlesRef.current.length < MAX_PARTICLES) {
        particlesRef.current.push(
          createParticle(mouseRef.current.x, mouseRef.current.y)
        );
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      handlePointer(event.clientX, event.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return;
      const touch = event.touches[0];
      handlePointer(touch.clientX, touch.clientY);
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(time - lastTime, 16);
      lastTime = time;

      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();

      const particles = particlesRef.current;

      // 파티클 업데이트 및 렌더링
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];

        particle.life += delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        // 속도 감소 (저항)
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        if (particle.life >= particle.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const progress = particle.life / particle.maxLife;
        const opacity = 1 - progress;

        // 글로우 효과를 위한 그라데이션
        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2
        );

        gradient.addColorStop(
          0,
          particle.color.replace(/[\d.]+\)$/, `${opacity})`)
        );
        gradient.addColorStop(
          0.5,
          particle.color.replace(/[\d.]+\)$/, `${opacity * 0.5})`)
        );
        gradient.addColorStop(1, particle.color.replace(/[\d.]+\)$/, "0)"));

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        context.fill();

        // 중심 점
        context.fillStyle = particle.color.replace(/[\d.]+\)$/, `${opacity})`);
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.size * 0.5,
          0,
          Math.PI * 2
        );
        context.fill();
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 20,
      }}
    />
  );
}
