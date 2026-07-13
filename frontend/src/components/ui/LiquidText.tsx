import React, { useEffect, useRef } from 'react';

interface LiquidTextProps {
  text: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  padding?: number;
  className?: string;
}

export function LiquidText({
  text,
  fontFamily = 'Nunito',
  fontSize = 30,
  fill = '#f8fafc',
  padding = 40,
  className = ''
}: LiquidTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Render original text to offscreen canvas
    const offscreen = document.createElement('canvas');
    const octx = offscreen.getContext('2d');
    
    // Prep font to measure
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(text).width;
    
    const width = textWidth + padding * 2;
    const height = fontSize * 2 + padding * 2;
    
    canvas.width = width;
    canvas.height = height;
    offscreen.width = width;
    offscreen.height = height;
    
    if (!octx) return;
    octx.font = `600 ${fontSize}px ${fontFamily}`;
    octx.fillStyle = fill;
    octx.textBaseline = 'middle';
    octx.fillText(text, padding, height / 2);
    
    let volatility = 0;
    let targetVolatility = 0;
    let speed = 0.05;
    let time = 0;
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Interpolate volatility smoothly
      volatility += (targetVolatility - volatility) * 0.1;
      
      if (volatility < 0.001 && targetVolatility === 0) {
         // Stable, draw exactly as is
         ctx.drawImage(offscreen, 0, 0);
      } else {
         // Distort
         time += speed;
         
         // Draw horizontally sliced waves (1px segments)
         for (let y = 0; y < height; y += 2) {
           const yNormal = y / height;
           // Liquid wave math
           const wave1 = Math.sin(yNormal * 12 + time) * 15 * volatility;
           const wave2 = Math.cos(yNormal * 25 - time * 1.5) * 5 * volatility;
           const xOffset = wave1 + wave2;
           
           ctx.drawImage(
             offscreen,
             0, y, width, 2,
             xOffset, y, width, 2
           );
         }
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();

    const handleMouseEnter = () => {
      targetVolatility = 1.0;
      speed = 0.15;
    };
    
    const handleMouseLeave = () => {
      targetVolatility = 0;
      speed = 0.05;
    };

    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [text, fontFamily, fontSize, fill, padding]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`relative inline-block cursor-default ${className}`}
      style={{ margin: `-${padding}px`, verticalAlign: 'middle' }}
    />
  );
}
