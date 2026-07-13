import React, { useEffect, useState } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        * {
          cursor: none !important;
        }
      `}} />
      <div
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <div
          className="absolute h-8 w-8 -ml-4 -mt-4 rounded-full border border-[#3ECF8E] mix-blend-difference transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          }}
        />
        <div
          className="absolute h-1.5 w-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#3ECF8E]"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          }}
        />
      </div>
    </>
  );
}
