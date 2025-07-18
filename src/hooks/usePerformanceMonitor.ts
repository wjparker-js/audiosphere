import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        memoryUsage: (performance as any).memory ? {
          used: `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB`,
          total: `${Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)}MB`
        } : 'Not available'
      });
    }

    // Send metrics to analytics in production (if needed)
    if (process.env.NODE_ENV === 'production' && renderTime > 100) {
      // Only log slow renders
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });

  return {
    startTiming: () => {
      renderStartTime.current = performance.now();
    },
    endTiming: (operationName: string) => {
      const endTime = performance.now();
      const duration = endTime - renderStartTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} - ${operationName}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
  };
}

// Hook for measuring API call performance
export function useApiPerformance() {
  const measureApiCall = async <T>(
    apiCall: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Performance] ${operationName}: ${duration.toFixed(2)}ms`);
      }
      
      // Log slow API calls
      if (duration > 2000) {
        console.warn(`Slow API call detected: ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`[API Error] ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };

  return { measureApiCall };
}