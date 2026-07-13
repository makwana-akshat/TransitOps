import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

interface ScrambleTextProps {
  text: string;
  characters?: string;
  speed?: number;
  duration?: number;
  className?: string;
}

export function ScrambleText({
  text,
  characters = "!<>-_\\/[]{}—=+*^?#________",
  speed = 30,
  duration = 600,
  className = "",
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let frame = 0;
    const totalFrames = duration / speed;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setDisplayText(() =>
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            
            const resolveFrame = (totalFrames / text.length) * index;
            if (frame > resolveFrame) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      frame++;

      if (frame > totalFrames) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, speed);
  };

  useEffect(() => {
    scramble();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <motion.span
      className={className}
      onMouseEnter={scramble}
    >
      {displayText}
    </motion.span>
  );
}
