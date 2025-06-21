import React, { useEffect } from 'react';
import { View } from 'react-native';

interface ErrorSuppressorProps {
  children: React.ReactNode;
}

const ErrorSuppressor: React.FC<ErrorSuppressorProps> = ({ children }) => {
  useEffect(() => {
    // Suppress React warnings at the component level
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('useInsertionEffect') || 
          message.includes('schedule updates') ||
          message.includes('Warning: useInsertionEffect')) {
        return; // Completely suppress
      }
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('useInsertionEffect') || 
          message.includes('schedule updates') ||
          message.includes('Warning: useInsertionEffect')) {
        return; // Completely suppress
      }
      originalConsoleWarn.apply(console, args);
    };

    // Override React's console.error for warnings
    const originalReactConsoleError = (console as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.rendererPackageName;
    if (originalReactConsoleError) {
      (console as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.rendererPackageName = 'react-native';
    }

    return () => {
      // Restore original console methods
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  return <View style={{ flex: 1 }}>{children}</View>;
};

export default ErrorSuppressor; 