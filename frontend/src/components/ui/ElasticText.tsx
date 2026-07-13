import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

export interface ElasticTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
  stiffness?: number;
  linkStiffness?: number;
  damping?: number;
  driveGain?: number;
  reach?: number;
  offsetClamp?: number;
  minEndMobility?: number;
}

export function ElasticText({
  text,
  className,
  as: Component = 'div',
  stiffness = 300,        // K_RETURN
  linkStiffness = 600,    // K_LINK
  damping = 25,           // DAMPING
  driveGain = 400,        // DRIVE_GAIN
  reach = 100,            // SIGMA (px reach of cursor Gaussian)
  offsetClamp = 60,       // Max px displacement limit from mouse
  minEndMobility = 0.1,   // How much the ends can move (0.0 to 1.0)
}: ElasticTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  
  // Physics state
  const physicsRef = useRef<{
    y: number;
    vy: number;
    restingX: number;
    mobility: number;
  }[]>([]);
  
  const mouseRef = useRef({ x: Infinity, y: Infinity });
  const baseRef = useRef({ y: 0 });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const letters = text.split('');
    const N = letters.length;
    
    // Initialize physics state array
    physicsRef.current = Array.from({ length: N }, (_, i) => {
      // Half sine wave across the indices for mobility taper
      // Ends are pinned, center moves freely
      const phase = N > 1 ? i / (N - 1) : 0.5;
      const taper = Math.sin(Math.PI * phase);
      const mobility = minEndMobility + (1 - minEndMobility) * taper;
      
      return {
        y: 0,
        vy: 0,
        restingX: 0,
        mobility
      };
    });

    const updateRects = () => {
      if (!containerRef.current) return;
      
      // Temporarily clear transforms to measure true layout position
      for (let i = 0; i < N; i++) {
        if (letterRefs.current[i]) {
          letterRefs.current[i]!.style.transform = 'none';
        }
      }
      
      // Measure container baseline
      const containerRect = containerRef.current.getBoundingClientRect();
      baseRef.current.y = containerRect.top + containerRect.height / 2;
      
      // Measure resting X for Gaussian distance
      for (let i = 0; i < N; i++) {
        const node = letterRefs.current[i];
        if (node) {
          const rect = node.getBoundingClientRect();
          physicsRef.current[i].restingX = rect.left + rect.width / 2;
        }
      }
    };

    updateRects();
    window.addEventListener('resize', updateRects);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouseRef.current.x = Infinity;
      mouseRef.current.y = Infinity;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dtMs = time - lastTime;
      lastTime = time;
      
      // Clamp dt to avoid huge jumps if tab was inactive (max 33ms / ~30fps)
      const dt = Math.min(dtMs / 1000, 0.033); 
      
      const { x: mX, y: mY } = mouseRef.current;
      const bY = baseRef.current.y;
      
      // Calculate clamped vertical offset from the text baseline
      let offset = mY - bY;
      const clampedOffset = Math.max(-offsetClamp, Math.min(offsetClamp, offset));

      const state = physicsRef.current;
      
      // Pass 1: Compute accelerations
      const newVys = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const { y, vy, restingX, mobility } = state[i];
        
        // Pinned boundaries: missing neighbor acts as an anchor at y=0
        const leftY = i > 0 ? state[i - 1].y : 0;
        const rightY = i < N - 1 ? state[i + 1].y : 0;
        
        const neighborPull = linkStiffness * (leftY + rightY - 2 * y);
        const returnPull = -stiffness * y;
        
        let drive = 0;
        if (mX !== Infinity && mY !== Infinity) {
           const dx = restingX - mX;
           const dy = bY - mY;
           const distSq = dx * dx + dy * dy;
           
           // 2D Radial Gaussian falloff ensures the cursor only pulls when physically near the text
           const influence = Math.exp(-distSq / (2 * reach * reach));
           
           // Sharp cutoff optimization if completely out of bounds
           if (influence > 0.01) {
             drive = influence * clampedOffset * driveGain * mobility;
           }
        }
        
        const accel = neighborPull + returnPull - damping * vy + drive;
        newVys[i] = vy + accel * dt;
      }
      
      // Pass 2: Integration and rendering
      for (let i = 0; i < N; i++) {
         state[i].vy = newVys[i];
         state[i].y += state[i].vy * dt;
         
         const node = letterRefs.current[i];
         if (node) {
            const y = state[i].y;
            const leftY = i > 0 ? state[i - 1].y : 0;
            const rightY = i < N - 1 ? state[i + 1].y : 0;
            
            // Slope-based tilt
            // We approximate dx as 20px for slope calculation to keep angles smooth
            const dy = rightY - leftY;
            const dx = 20; 
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            angle = Math.max(-24, Math.min(24, angle)); 
            
            // Stretch slightly when pulled far from baseline
            const stretch = 1 + Math.abs(y) * 0.003; 
            
            node.style.transform = `translateY(${y}px) rotate(${angle}deg) scaleY(${stretch})`;
         }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', updateRects);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text, prefersReducedMotion, stiffness, linkStiffness, damping, driveGain, reach, offsetClamp, minEndMobility]);

  const letters = text.split('');

  return (
    <Component ref={containerRef} className={cn("inline-flex items-center", className)}>
      {letters.map((char, i) => (
        <span
          key={i}
          ref={(el) => (letterRefs.current[i] = el)}
          className="inline-block origin-center transition-none will-change-transform"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </span>
      ))}
    </Component>
  );
}
