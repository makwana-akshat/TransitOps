import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTour, TOURS } from '@/contexts/TourContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { PillButton } from '@/components/ui/Button';
import { X } from 'lucide-react';

export function TourOverlay() {
  const { activeTourId, activeStepIndex, activeStep, targetRect, skipTour, nextStep, prevStep } = useTour();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!activeTourId || !activeStep || !targetRect) return null;

  const tour = TOURS[activeTourId];
  if (!tour) return null;

  const totalSteps = tour.steps.length;

  // Add breathing padding to the target
  const PADDING = 8;
  const RADIUS = 8;

  const hx = targetRect.left - PADDING;
  const hy = targetRect.top - PADDING;
  const hw = targetRect.width + PADDING * 2;
  const hh = targetRect.height + PADDING * 2;

  // SVG path with outer rectangle and a rounded inner hole.
  // Using fillRule="evenodd", drawing direction doesn't matter as long as it's a subpath.
  const pathData = `M 0 0 H ${windowSize.width} V ${windowSize.height} H 0 Z M ${hx + RADIUS} ${hy} a ${RADIUS} ${RADIUS} 0 0 0 -${RADIUS} ${RADIUS} V ${hy + hh - RADIUS} a ${RADIUS} ${RADIUS} 0 0 0 ${RADIUS} ${RADIUS} H ${hx + hw - RADIUS} a ${RADIUS} ${RADIUS} 0 0 0 ${RADIUS} -${RADIUS} V ${hy + RADIUS} a ${RADIUS} ${RADIUS} 0 0 0 -${RADIUS} -${RADIUS} Z`;

  // Render Tooltip Placement calculations
  let tooltipY = 0;
  let tooltipX = 0;
  let xTransform = '-50%';
  let yTransform = '-50%';
  
  // Arrow styles
  let arrowClass = "";
  let arrowStyle: React.CSSProperties = {};

  const GAP = PADDING + 16; // GAP from original element includes padding + extra
  
  switch (activeStep.placement) {
    case 'top':
      tooltipY = targetRect.top - GAP;
      tooltipX = targetRect.left + targetRect.width / 2;
      yTransform = '-100%';
      arrowClass = "bottom-[-6px] left-1/2 -ml-[6px] border-b border-r border-border-glass";
      break;
    case 'bottom':
      tooltipY = targetRect.bottom + GAP;
      tooltipX = targetRect.left + targetRect.width / 2;
      yTransform = '0%';
      arrowClass = "top-[-6px] left-1/2 -ml-[6px] border-t border-l border-border-glass";
      break;
    case 'left':
      tooltipY = targetRect.top + targetRect.height / 2;
      tooltipX = targetRect.left - GAP;
      xTransform = '-100%';
      arrowClass = "right-[-6px] top-1/2 -mt-[6px] border-t border-r border-border-glass";
      break;
    case 'right':
      tooltipY = targetRect.top + targetRect.height / 2;
      tooltipX = targetRect.right + GAP;
      xTransform = '0%';
      arrowClass = "left-[-6px] top-1/2 -mt-[6px] border-b border-l border-border-glass";
      break;
  }

  // Adjust for screen boundaries to prevent offscreen tooltips
  const tooltipWidth = 320;
  // If placed top/bottom, ensure it doesn't overflow horizontally
  if (activeStep.placement === 'top' || activeStep.placement === 'bottom') {
    if (tooltipX < tooltipWidth / 2 + 16) {
      tooltipX = tooltipWidth / 2 + 16;
      arrowStyle.left = `${targetRect.left + targetRect.width / 2 - (tooltipX - tooltipWidth / 2)}px`;
    } else if (tooltipX + tooltipWidth / 2 > windowSize.width - 16) {
      tooltipX = windowSize.width - tooltipWidth / 2 - 16;
      arrowStyle.left = `${targetRect.left + targetRect.width / 2 - (tooltipX - tooltipWidth / 2)}px`;
    }
  }

  // Same for vertical boundaries on left/right placement
  const tooltipHeight = 180; // approximate
  if (activeStep.placement === 'left' || activeStep.placement === 'right') {
    if (tooltipY < tooltipHeight / 2 + 16) {
      tooltipY = tooltipHeight / 2 + 16;
      arrowStyle.top = `${targetRect.top + targetRect.height / 2 - (tooltipY - tooltipHeight / 2)}px`;
    } else if (tooltipY + tooltipHeight / 2 > windowSize.height - 16) {
      tooltipY = windowSize.height - tooltipHeight / 2 - 16;
      arrowStyle.top = `${targetRect.top + targetRect.height / 2 - (tooltipY - tooltipHeight / 2)}px`;
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 pointer-events-none">
        <svg width="100%" height="100%" className="pointer-events-none">
          <motion.path
            initial={{ d: pathData, opacity: 0 }}
            animate={{ d: pathData, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            fill="rgba(10,10,13,0.72)"
            fillRule="evenodd"
            pointerEvents="auto" // The filled dark area catches clicks! The hole lets them pass.
          />
        </svg>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTourId}-${activeStepIndex}`}
          className="fixed z-[51] w-80"
          initial={{ opacity: 0, scale: 0.95, y: activeStep.placement === 'bottom' ? -10 : activeStep.placement === 'top' ? 10 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            top: tooltipY,
            left: tooltipX,
            transform: `translate(${xTransform}, ${yTransform})`,
          }}
        >
          <GlassCard className="p-5 shadow-2xl relative overflow-visible bg-bg-card/95 backdrop-blur-xl">
            {/* The Arrow */}
            <div 
              className={`absolute w-3 h-3 bg-bg-card rotate-45 ${arrowClass}`} 
              style={arrowStyle}
            />

            <div className="absolute top-3 right-3 z-10">
              <button onClick={skipTour} className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <h3 className="font-semibold text-text-primary mb-2 pr-6 relative z-10">{activeStep.title}</h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed relative z-10">
              {activeStep.description}
            </p>

            <div className="flex items-center justify-between mt-auto relative z-10">
              <button onClick={skipTour} className="text-sm text-text-muted hover:text-text-primary transition-colors font-medium">
                Skip tour
              </button>
              
              <div className="flex items-center gap-2">
                {activeStepIndex > 0 && (
                  <PillButton variant="outline" onClick={prevStep}>
                    Back
                  </PillButton>
                )}
                <PillButton variant="primary" onClick={nextStep}>
                  {activeStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
                </PillButton>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-5 relative z-10">
              {tour.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeStepIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
