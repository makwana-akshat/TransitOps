import React, { createContext, useContext, useEffect, useState } from 'react';
import { driver } from 'driver.js';
import { useNavigate, useLocation } from 'react-router-dom';

interface TourContextType {
  startTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenTour, setHasSeenTour] = useState(
    localStorage.getItem('transitops_tour_seen') === 'true'
  );
  const navigate = useNavigate();
  const location = useLocation();

  const startTour = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => initDriver(), 100);
    } else {
      initDriver();
    }
  };

  const initDriver = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: 'Done',
      nextBtnText: 'Next &rarr;',
      prevBtnText: '&larr; Previous',
      steps: [
        {
          element: '#tour-sidebar',
          popover: {
            title: 'Main Navigation',
            description: 'Quickly access all modules like Vehicles, Drivers, and Maintenance from here.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#tour-search',
          popover: {
            title: 'Global Search',
            description: 'Find any vehicle, trip, or record instantly across your entire fleet.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-kpis',
          popover: {
            title: 'Performance KPIs',
            description: 'Monitor your most critical fleet statistics at a glance, updated in real-time.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-quick-actions',
          popover: {
            title: 'Quick Actions',
            description: 'Rapidly register vehicles, create trips, or schedule maintenance without leaving the dashboard.',
            side: 'left',
            align: 'start',
          },
        },
        {
          element: '#tour-nav-vehicles',
          popover: {
            title: 'Explore Vehicles',
            description: 'Let us check out the Vehicles module next.',
            side: 'right',
            align: 'center',
            onNextClick: () => {
              navigate('/vehicles');
              setTimeout(() => {
                driverObj.moveNext();
              }, 300);
            }
          },
        },
        {
          element: '#tour-vehicles-table',
          popover: {
            title: 'Fleet Inventory',
            description: 'Here you can view and manage your entire fleet of vehicles.',
            side: 'top',
            align: 'center',
            onNextClick: () => {
              navigate('/maintenance');
              setTimeout(() => {
                driverObj.moveNext();
              }, 300);
            }
          },
        },
        {
          element: '#tour-maintenance-stats',
          popover: {
            title: 'Maintenance Tracking',
            description: 'Stay on top of vehicle health, repair costs, and schedules.',
            side: 'bottom',
            align: 'start',
            onNextClick: () => {
              navigate('/');
              setTimeout(() => {
                driverObj.moveNext();
              }, 300);
            }
          },
        },
        {
          element: '#tour-help',
          popover: {
            title: 'Need Help?',
            description: 'You can restart this onboarding tour at any time by clicking the help icon.',
            side: 'bottom',
            align: 'end',
          },
        },
      ],
    });

    driverObj.drive();
    
    if (!hasSeenTour) {
      localStorage.setItem('transitops_tour_seen', 'true');
      setHasSeenTour(true);
    }
  };

  useEffect(() => {
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSeenTour]);

  return (
    <TourContext.Provider value={{ startTour }}>
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
