import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '../features/auth/hooks';

interface UseInactivityDetectorOptions {
  // Time in milliseconds before showing warning (default: 1 minute = 60000ms)
  inactivityTimeout?: number;
  // Time in milliseconds for countdown after warning (default: 30 seconds = 30000ms)
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
    warningTimeout = 30000,    // 30 seconds countdown after warning
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
  const [remainingTime, setRemainingTime] = useState(Math.floor(warningTimeout / 1000));
  
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isWarningVisibleRef = useRef(false); // Track warning state in ref for event handlers
  
  // Get authentication state
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Clear inactivity timer only
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Clear countdown interval only
  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    clearInactivityTimer();
    clearCountdownInterval();
  }, [clearInactivityTimer, clearCountdownInterval]);

  // Start countdown when modal is shown
  const startCountdown = useCallback(() => {
    const totalSeconds = Math.floor(warningTimeout / 1000);
    setRemainingTime(totalSeconds);
    
    // Clear any existing countdown
    clearCountdownInterval();
    
    // Start new countdown
    countdownIntervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          // Time's up - clear interval and dispatch logout event
          clearCountdownInterval();
          window.dispatchEvent(new CustomEvent('sessionTimeout'));
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  }, [warningTimeout, clearCountdownInterval]);

  // Start the inactivity timer
  const startInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return;
    
    // Clear existing inactivity timer
    clearInactivityTimer();
    
    // Start new inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      // Show warning modal
      setIsWarningVisible(true);
      isWarningVisibleRef.current = true;
      
      // Start countdown
      startCountdown();
    }, inactivityTimeout);
  }, [isAuthenticated, inactivityTimeout, clearInactivityTimer, startCountdown]);

  // Hide warning and reset timer (user confirmed they're active)
  const hideWarning = useCallback(() => {
    setIsWarningVisible(false);
    isWarningVisibleRef.current = false;
    setRemainingTime(Math.floor(warningTimeout / 1000));
    clearAllTimers();
    
    // Restart inactivity detection after modal closes
    startInactivityTimer();
  }, [warningTimeout, clearAllTimers, startInactivityTimer]);

  // Reset the inactivity timer (called on user activity)
  const resetInactivityTimer = useCallback(() => {
    // Only reset if warning modal is NOT visible
    if (!isWarningVisibleRef.current) {
      startInactivityTimer();
    }
  }, [startInactivityTimer]);

  // Handle user activity - only when modal is NOT visible
  const handleActivity = useCallback(() => {
    // Don't detect activity while modal is open
    if (!isWarningVisibleRef.current) {
      resetInactivityTimer();
    }
  }, [resetInactivityTimer]);

  // Set up event listeners
  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      setIsWarningVisible(false);
      isWarningVisibleRef.current = false;
      return;
    }

    // Start initial inactivity timer
    startInactivityTimer();

    // Add event listeners for activity detection
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isWarningVisibleRef.current) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only re-run when auth state changes

  return {
    isWarningVisible,
    remainingTime,
    resetInactivityTimer,
    hideWarning,
  };
};

export default useInactivityDetector;
