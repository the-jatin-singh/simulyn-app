"use client";

import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position values for interactivity
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the 3D tilt effect
  const springConfig = { damping: 20, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      mouseX.set(x);
      mouseY.set(y);

      // Update CSS variables for the background glow
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const letters = "SIMULYN".split("");

  return (
    <div 
      ref={containerRef}
      className="relative flex h-screen w-screen flex-col items-center justify-center bg-black overflow-hidden select-none"
    >
      {/* Background Interactivity */}
      <div className="interactive-bg" />
      <div className="noise-overlay" />

      {/* Centered Interactive Logo */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 cursor-default"
      >
        <h1 className="flex text-6xl font-black tracking-tighter text-white sm:text-8xl md:text-9xl">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              className="letter-animate inline-block logo-glow"
              style={{ transformStyle: "preserve-3d" }}
              whileHover={{ 
                scale: 1.1, 
                color: "var(--accent)", 
                z: 50,
                transition: { duration: 0.2 }
              }}
            >
              {letter}
            </motion.span>
          ))}
        </h1>
      </motion.div>

      {/* Decorative Glow follow cursor (subtle) */}
      <motion.div
        className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]"
        style={{
          x: useTransform(mouseX, (v) => v - 200),
          y: useTransform(mouseY, (v) => v - 200),
        }}
      />

      {/* Bottom Minimal Text */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-2 text-center"
      >
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-white">
          Soon coming beta
        </p>
        <div className="h-px w-12 bg-zinc-800" />
        <p className="text-[10px] text-zinc-600">
          2026 &copy; SIMULYN TECHNOLOGIES
        </p>
      </motion.footer>
    </div>
  );
}
