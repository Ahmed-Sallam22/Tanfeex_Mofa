import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '../features/auth/hooks';

interface UseInactivityDetectorOptions {
  // Time in milliseconds before showing warning (default: 1 minute = 60000ms)
  inactivityTimeout?: number;
  // Time in milliseconds for countdown after warning (default: 1 minute = 60000ms)
  warningTimeout?: number;
  // Events to track for activity
  events?: string[];
}

interface UseInactivityDetectorReturn {
  isWarningVisible: boolean;
  remainingTime: number;
  resetInactivityTimer: () => void;
  hideWarning: () => void;
}

export const useInactivityDetector = (
  options: UseInactivityDetectorOptions = {}
): UseInactivityDetectorReturn => {
  const {
    inactivityTimeout = 60000, // 1 minute of inactivity before warning
    warningTimeout = 60000,    // 1 minute countdown after warning
    events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'wheel',
    ],
  } = options;

  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(warningTimeout / 1000);
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  
  // Get authentication state
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // Start the inactivity timer
  const startInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return;
    
    clearAllTimers();
    
    inactivityTimerRef.current = setTimeout(() => {
      // Show warning modal
      setIsWarningVisible(true);
      setRemainingTime(warningTimeout / 1000);
      
      // Start countdown
      let timeLeft = warningTimeout / 1000;
      countdownTimerRef.current = setInterval(() => {
        timeLeft -= 1;
        setRemainingTime(timeLeft);
        
        if (timeLeft <= 0) {
          clearAllTimers();
          // Dispatch event for session timeout
          window.dispatchEvent(new CustomEvent('sessionTimeout'));
        }
      }, 1000);
    }, inactivityTimeout);
  }, [isAuthenticated, inactivityTimeout, warningTimeout, clearAllTimers]);

  // Reset the inactivity timer (called on user activity)
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (!isWarningVisible) {
      startInactivityTimer();
    }
  }, [isWarningVisible, startInactivityTimer]);

  // Hide warning and reset timer (user confirmed they're active)
  const hideWarning = useCallback(() => {
    setIsWarningVisible(false);
    setRemainingTime(warningTimeout / 1000);
    clearAllTimers();
    startInactivityTimer();
  }, [warningTimeout, clearAllTimers, startInactivityTimer]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    // Only reset if warning is not visible
    if (!isWarningVisible) {
      resetInactivityTimer();
    }
  }, [isWarningVisible, resetInactivityTimer]);

  // Set up event listeners
  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      setIsWarningVisible(false);
      return;
    }

    // Start initial timer
    startInactivityTimer();

    // Add event listeners for activity detection
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Also listen to visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isWarningVisible) {
        resetInactivityTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearAllTimers();
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, events, handleActivity, startInactivityTimer, clearAllTimers, isWarningVisible, resetInactivityTimer]);

  return {
    isWarningVisible,
    remainingTime,
    resetInactivityTimer,
    hideWarning,
  };
};

export default useInactivityDetector;
