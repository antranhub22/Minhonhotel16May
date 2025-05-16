import React, { useState, useEffect, Suspense, ReactNode } from 'react';
import { lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const ReferenceSwiper = lazy(() => import('./ReferenceSwiper'));

// Loading skeleton component
const ReferenceSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="text-center p-4">
    <h2 className="text-red-500 mb-2">Something went wrong:</h2>
    <pre className="text-sm text-gray-600 mb-4">{error.message}</pre>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Try again
    </button>
  </div>
);

const Reference = () => {
  const [filteredReferences, setFilteredReferences] = useState<any[]>([]);
  const [renderReferenceCard, setRenderReferenceCard] = useState<((reference: any) => ReactNode) | null>(null);
  const [getSlidesPerView, setGetSlidesPerView] = useState<() => number | 'auto'>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch your data here
        // const response = await fetch('/api/references');
        // const data = await response.json();
        // setFilteredReferences(data);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFilteredReferences([]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <ReferenceSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={() => setError(null)} />;
  }

  return (
    <div className="container mx-auto px-4">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<ReferenceSkeleton />}>
          <ReferenceSwiper
            filteredReferences={filteredReferences}
            renderReferenceCard={renderReferenceCard || ((reference) => <div>{reference.title}</div>)}
            getSlidesPerView={getSlidesPerView}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default Reference; 