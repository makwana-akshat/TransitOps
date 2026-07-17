import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  target: string; // The value of the data-tour attribute
  title: string;
  description: string;
  placement: TourPlacement;
  route?: string;
}

export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
}

export const TOURS: Record<string, Tour> = {
  'getting-started': {
    id: 'getting-started',
    name: 'Getting Started',
    steps: [
      { target: 'kpi-active-vehicles', title: 'Your fleet at a glance', description: 'These cards show Active Vehicles, Available units, and how many are currently In Maintenance — pulled live from your registry.', placement: 'bottom' },
      { target: 'kpi-drivers-on-duty', title: "Who's on the road", description: 'Drivers On Duty and Trips Today update in real time as trips are dispatched and completed.', placement: 'bottom' },
      { target: 'chart-fleet-utilization', title: 'Spot the trends', description: 'This shows your monthly fleet utilization so you can catch seasonal peaks before they catch you.', placement: 'top' },
      { target: 'chart-vehicle-status', title: 'Fleet composition', description: 'A breakdown of your entire fleet by current status — Available, On Trip, In Shop, and Retired.', placement: 'left' },
      { target: 'quick-actions-card', title: 'Fast paths to common tasks', description: 'Register a vehicle, create a trip, schedule maintenance, or add a driver — all from right here.', placement: 'left' },
      { target: 'recent-activity', title: 'Stay in the loop', description: 'Every dispatch, completion, and maintenance update from your team shows up here as it happens.', placement: 'top' },
    ]
  },
  'vehicle-registry': {
    id: 'vehicle-registry',
    name: 'Vehicle Registry',
    steps: [
      { target: 'vehicles-search-filter', title: 'Find any vehicle fast', description: 'Search by registration number or name, or narrow the list with Status and Region filters.', placement: 'bottom', route: '/vehicles' },
      { target: 'vehicles-register-button', title: 'Add a new vehicle', description: "Click here to register a vehicle — you'll need its registration number, capacity, and acquisition cost.", placement: 'left', route: '/vehicles' },
      { target: 'vehicles-table', title: 'Your master registry', description: "Every vehicle's status, capacity, odometer, and region — click the ⋯ menu on any row to view, edit, or retire it.", placement: 'top', route: '/vehicles' },
      { target: 'vehicles-status-badge', title: 'Status drives dispatch', description: 'Only vehicles marked Available show up when dispatchers create a trip — In Shop and Retired vehicles are automatically hidden.', placement: 'right', route: '/vehicles' },
    ]
  },
  'create-trip': {
    id: 'create-trip',
    name: 'Create and Dispatch a Trip',
    steps: [
      { target: 'quick-actions-create-trip', title: 'Start here', description: 'Click Create Trip to begin dispatching a new job.', placement: 'left', route: '/' },
      { target: 'trip-form-vehicle-select', title: 'Pick an available vehicle', description: 'Only vehicles with status Available appear here — anything In Shop or On Trip is filtered out automatically.', placement: 'bottom', route: '/trips' },
      { target: 'trip-form-driver-select', title: 'Pick a compliant driver', description: 'Drivers with a suspended or expired license are automatically excluded from this list.', placement: 'bottom', route: '/trips' },
      { target: 'trips-table-row-draft', title: 'Your trip is saved as a Draft', description: 'Click any row to open its detail panel.', placement: 'top', route: '/trips' },
      { target: 'trip-detail-dispatch-btn', title: 'Dispatch when ready', description: 'This sets the trip to Dispatched and automatically updates the vehicle and driver status to On Trip / On Duty.', placement: 'top', route: '/trips' },
      { target: 'trip-detail-complete-btn', title: 'Wrap it up', description: 'Once the trip is done, Complete Trip frees the vehicle and driver back to Available.', placement: 'top', route: '/trips' },
    ]
  }
};

interface TourContextType {
  activeTourId: string | null;
  activeStepIndex: number;
  activeStep: TourStep | null;
  targetRect: DOMRect | null;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  endTour: () => void;
  hasSeenTour: (tourId: string) => boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const activeTour = activeTourId ? TOURS[activeTourId] : null;
  const activeStep = activeTour?.steps[activeStepIndex] || null;

  // Retrieve seen tours
  const getSeenTours = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem('transitops_tours_seen');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const markAsSeen = useCallback((tourId: string) => {
    const seen = getSeenTours();
    if (!seen.includes(tourId)) {
      seen.push(tourId);
      localStorage.setItem('transitops_tours_seen', JSON.stringify(seen));
    }
  }, [getSeenTours]);

  const hasSeenTour = useCallback((tourId: string) => {
    return getSeenTours().includes(tourId);
  }, [getSeenTours]);

  const endTour = useCallback(() => {
    if (activeTourId) markAsSeen(activeTourId);
    setActiveTourId(null);
    setActiveStepIndex(0);
    setTargetRect(null);
  }, [activeTourId, markAsSeen]);

  const skipTour = useCallback(() => {
    endTour();
  }, [endTour]);

  const startTour = useCallback((tourId: string) => {
    if (!TOURS[tourId]) return;
    setActiveTourId(tourId);
    setActiveStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    if (activeStepIndex < activeTour.steps.length - 1) {
      setActiveStepIndex(i => i + 1);
    } else {
      endTour();
    }
  }, [activeTour, activeStepIndex, endTour]);

  const prevStep = useCallback(() => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(i => i - 1);
    }
  }, [activeStepIndex]);

  // Handle route changes and finding elements
  useEffect(() => {
    if (!activeTour || !activeStep) {
      setTargetRect(null);
      return;
    }

    // Check if we need to navigate
    if (activeStep.route && location.pathname !== activeStep.route) {
      navigate(activeStep.route);
      return; // The next render cycle after navigation will handle finding the element
    }

    let retryCount = 0;
    let timeoutId: NodeJS.Timeout;

    const findTarget = () => {
      const el = document.querySelector(`[data-tour="${activeStep.target}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else if (retryCount < 10) { // Try for 1s (10 * 100ms)
        retryCount++;
        timeoutId = setTimeout(findTarget, 100);
      } else {
        console.warn(`Tour target [data-tour="${activeStep.target}"] not found. Skipping to next step.`);
        nextStep();
      }
    };

    // Small delay to allow react to paint
    timeoutId = setTimeout(findTarget, 100);

    // Re-calculate on resize or scroll
    const handleRecalculate = () => {
      const el = document.querySelector(`[data-tour="${activeStep.target}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleRecalculate);
    window.addEventListener('scroll', handleRecalculate, true); // true to catch scroll on inner elements

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleRecalculate);
      window.removeEventListener('scroll', handleRecalculate, true);
    };
  }, [activeTour, activeStep, location.pathname, navigate, nextStep]);

  // Handle Keyboard Navigation
  useEffect(() => {
    if (!activeTourId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTourId, nextStep, prevStep, skipTour]);

  // Auto-start "Getting Started" tour
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasSeenTour('getting-started') && location.pathname === '/') {
        startTour('getting-started');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [hasSeenTour, location.pathname, startTour]);

  // Disable scroll while tour is active
  useEffect(() => {
    if (activeTourId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeTourId]);

  return (
    <TourContext.Provider
      value={{
        activeTourId,
        activeStepIndex,
        activeStep,
        targetRect,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        endTour,
        hasSeenTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
