import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  return {
    width,
    height,
    isSmall: width < 768,
    isMedium: width >= 768 && width < 1024,
    isLarge: width >= 1024 && width < 1440,
    isXLarge: width >= 1440,
    isDesktop: width >= 1024,
    isTablet: width >= 768 && width < 1024,
    isMobile: width < 768,
    sidebarWidth: width >= 1024 ? 250 : 0,
    contentMaxWidth: Math.min(width - (width >= 1024 ? 250 : 0) - 40, 1400),
    gridColumns: width >= 1440 ? 4 : width >= 1024 ? 3 : width >= 768 ? 2 : 1,
  };
};
