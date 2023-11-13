import React, { createContext, useState, useContext } from 'react';

const TourContext = createContext();

export const TourProvider = ({ children }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const startTour = () => {
    setIsTourOpen(true);
    setStepIndex(0);
  };

  const nextStep = () => {
    setStepIndex(prev => prev + 1);
  };

  return (
    <TourContext.Provider value={{ isTourOpen, stepIndex, startTour, nextStep }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);