import { useState, useEffect } from 'react';

/**
 * Hook to detect media query matches
 * @param query - The media query string to match
 * @returns boolean - Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

/**
 * Hook to detect viewport height changes (useful for mobile keyboard detection)
 * @returns object - Contains viewport height and keyboard visibility
 */
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);
  const [initialHeight, setInitialHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial height
    setInitialHeight(window.innerHeight);
    setViewportHeight(window.innerHeight);

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      setViewportHeight(currentHeight);
      
      // Consider keyboard open if viewport height decreased by more than 150px
      // Use a more conservative threshold for better detection
      const heightDifference = initialHeight - currentHeight;
      const keyboardThreshold = window.innerWidth > 768 ? 200 : 150; // Different thresholds for different screen sizes
      
      setIsKeyboardOpen(heightDifference > keyboardThreshold);
    };

    const handleOrientationChange = () => {
      // Reset initial height on orientation change with a longer delay
      // to account for mobile browser UI changes
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newHeight = window.innerHeight;
        setInitialHeight(newHeight);
        setViewportHeight(newHeight);
        setIsKeyboardOpen(false);
      }, 800);
    };

    // Use visualViewport API if available for more accurate detection
    if (window.visualViewport) {
      const handleVisualViewportChange = () => {
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        setViewportHeight(currentHeight);
        
        const heightDifference = initialHeight - currentHeight;
        setIsKeyboardOpen(heightDifference > 150);
      };

      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
        clearTimeout(timeoutId);
      };
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(timeoutId);
    };
  }, [initialHeight]);

  return {
    viewportHeight,
    isKeyboardOpen,
    initialHeight
  };
}

/**
 * Hook to detect if the current viewport is mobile
 * @returns boolean - Whether the viewport is mobile (< 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Hook to detect if the current viewport is tablet
 * @returns boolean - Whether the viewport is tablet (768px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook to detect if the current viewport is desktop
 * @returns boolean - Whether the viewport is desktop (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Hook to get safe area insets for mobile devices
 * @returns object - Contains safe area measurements
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0'), 
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0')
      });
    };

    // Set CSS custom properties for safe areas
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --sat: env(safe-area-inset-top);
        --sar: env(safe-area-inset-right);
        --sab: env(safe-area-inset-bottom);
        --sal: env(safe-area-inset-left);
      }
    `;
    document.head.appendChild(style);

    updateSafeArea();

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(updateSafeArea, 100);
    });

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return safeArea;
}