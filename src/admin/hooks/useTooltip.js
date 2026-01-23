import { useState, useCallback, useRef, useEffect } from 'react';

const useTooltip = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);
  const elementRef = useRef(null);
  
  const show = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTooltipPosition({
          x: pageX + width / 2,
          y: pageY - 40
        });
        setShowTooltip(true);
      });
    }
  }, []);
  
  const hide = useCallback(() => {
    setShowTooltip(false);
  }, []);
  
  const showWithDelay = useCallback((delay = 500) => {
    timeoutRef.current = setTimeout(() => {
      show();
    }, delay);
  }, [show]);
  
  const cancelDelay = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    hide();
  }, [hide]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    showTooltip,
    tooltipPosition,
    elementRef,
    show,
    hide,
    showWithDelay,
    cancelDelay
  };
};

export default useTooltip;
