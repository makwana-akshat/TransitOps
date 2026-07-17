import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/utils/cn';
import { PrimaryButton, SecondaryButton } from './Button';

export interface Step {
  title: string;
  description?: string;
  content: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  initialStep?: number;
  onComplete?: () => void;
  onStepChange?: (step: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  initialStep = 0,
  onComplete,
  onStepChange,
  className,
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);

  const totalSteps = steps.length;
  const isCompleted = currentStep >= totalSteps;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) { 
      if (onComplete) onComplete();
      setCurrentStep((prev) => prev + 1);
    } else {
      setDirection(1);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onStepChange) onStepChange(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (onStepChange) onStepChange(prevStep);
    }
  };

  const handleStepClick = (index: number) => {
    if (index === currentStep || isCompleted) return;
    // Optional: allow jumping to completed steps
    if (index < currentStep) {
      setDirection(-1);
      setCurrentStep(index);
      if (onStepChange) onStepChange(index);
    }
  };

  const getStepStatus = (index: number) => {
    if (currentStep === index) return 'active';
    if (currentStep > index) return 'complete';
    return 'inactive';
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto flex flex-col", className)}>
      {/* Progress Indicators */}
      <div className="flex items-center w-full px-4 mb-8">
        {steps.map((step, index) => {
          const status = getStepStatus(index);          
          const isNotLast = index < totalSteps - 1;

          return (
            <React.Fragment key={index}>
              {/* Circle */}
              <div
                onClick={() => handleStepClick(index)}
                className={cn(
                  "relative flex flex-col items-center justify-center cursor-default z-10",
                  index < currentStep && "cursor-pointer"
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: status === 'active' || status === 'complete' ? '#3ECF8E' : '#222222',
                    color: status === 'active' || status === 'complete' ? '#000000' : '#8A8A93',
                    borderColor: status === 'active' ? '#3ECF8E' : 'transparent',
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-glass transition-colors border-2"
                >
                  {status === 'complete' ? (
                    <motion.svg
                      className="w-5 h-5 text-bg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
                
                {/* Optional Step Title below circle */}
                <div className="absolute top-12 w-32 text-center">
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    status === 'active' ? 'text-text-primary' : 'text-text-muted'
                  )}>
                    {step.title}
                  </span>
                </div>
              </div>

              {/* Connecting Line */}
              {isNotLast && (
                <div className="flex-1 h-1 mx-2 bg-[#222222] rounded-full overflow-hidden relative">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-accent-green"
                    initial={false}
                    animate={{
                      width: status === 'complete' ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 mt-6 bg-bg-card border border-border-glass rounded-3xl shadow-glass overflow-hidden flex flex-col relative min-h-[300px]">
        <div className="p-8 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            {!isCompleted ? (
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="h-full"
              >
                {steps[currentStep].content}
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary">All Done!</h3>
                <p className="text-text-muted">You have successfully completed this process.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {!isCompleted && (
          <div className="px-8 py-4 border-t border-border-glass bg-bg-elevated/50 flex items-center justify-between">
            <SecondaryButton
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Back
            </SecondaryButton>
            
            <PrimaryButton type="button" onClick={handleNext}>
              {isLastStep ? 'Complete' : 'Continue'}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
