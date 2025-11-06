import { useState, useEffect } from 'react';

const TUTORIAL_KEY = 'jobTracker_tutorialCompleted';

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_KEY) === 'true';
    setTutorialCompleted(completed);
    
    if (!completed) {
      // Show tutorial after a longer delay to ensure DOM is ready
      setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setTutorialCompleted(true);
    setShowTutorial(false);
  };

  const skipTutorial = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setTutorialCompleted(true);
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_KEY);
    setTutorialCompleted(false);
    setShowTutorial(true);
  };

  return {
    showTutorial,
    tutorialCompleted,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
};
