import React, { useEffect, lazy, memo, Suspense } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Link } from 'wouter';
import { History } from 'lucide-react';
import InfographicSteps from './InfographicSteps';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Image } from './ui/Image';
import ErrorBoundary from './ErrorBoundary';
import { Language, InterfaceLayer } from '@/types';
import OnboardingModal from './OnboardingModal';
import VersionChecker from './VersionChecker';

// Lazy load interfaces
const Interface1 = lazy(() => import('./Interface1'));
const Interface2 = lazy(() => import('./Interface2'));
const Interface3 = lazy(() => import('./Interface3'));
const Interface3Vi = lazy(() => import('./Interface3Vi'));
const Interface3Fr = lazy(() => import('./Interface3Fr'));
const Interface4 = lazy(() => import('./Interface4'));

// Loading component
const LoadingFallback = memo(() => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-lg text-gray-400">Đang tải giao diện...</p>
    </div>
  </div>
));

// Header component
const Header = memo(({ currentInterface, language }: { currentInterface: InterfaceLayer; language: Language }) => (
  <header className="w-full bg-primary text-white p-4 shadow-md">
    <div className="container mx-auto flex items-center justify-between px-2">
      <div className="w-16 flex-shrink-0 flex items-center justify-start ml-1 sm:ml-4 mr-2 sm:mr-6">
        <Image 
          src="/assets/references/images/minhon-logo.jpg" 
          alt="Minhon Logo" 
          className="h-10 sm:h-14 w-auto rounded-lg shadow-md bg-white/80 p-1"
          loading="eager"
        />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-xs sm:max-w-md">
          <InfographicSteps 
            horizontal 
            compact 
            currentStep={
              currentInterface === 'interface3' ? 3 :
              currentInterface === 'interface2' ? 2 : 1
            }
            language={language}
          />
        </div>
      </div>
      <div className="w-10 flex-shrink-0 flex items-center justify-end ml-2 sm:ml-6 mr-1 sm:mr-2">
        <Link href="/call-history">
          <a 
            className="flex items-center gap-1 px-2 py-1 rounded bg-primary-dark text-white text-xs sm:text-sm hover:bg-primary-darker transition-colors"
            aria-label="View Call History"
          >
            <History className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Call History</span>
          </a>
        </Link>
      </div>
    </div>
  </header>
));

// Interface container component
const InterfaceContainer = memo(({ currentInterface }: { currentInterface: InterfaceLayer }) => (
  <div className="relative w-full h-full" id="interfaceContainer">
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Interface1 isActive={currentInterface === 'interface1'} />
        <Interface2 isActive={currentInterface === 'interface2'} />
        <Interface3 isActive={currentInterface === 'interface3'} />
        <Interface3Vi isActive={currentInterface === 'interface3vi'} />
        <Interface3Fr isActive={currentInterface === 'interface3fr'} />
        <Interface4 isActive={currentInterface === 'interface4'} />
      </Suspense>
    </ErrorBoundary>
  </div>
));

const VoiceAssistant: React.FC = () => {
  const assistantContext = useAssistant();
  const currentInterface = (assistantContext as any)?.currentInterface || 'interface1';
  const language = (assistantContext as any)?.language || 'en';
  
  // Initialize WebSocket connection
  useWebSocket();

  return (
    <div 
      className="relative h-screen overflow-hidden font-sans text-gray-800 bg-neutral-50" 
      id="app"
      role="application"
      aria-label="Voice Assistant"
    >
      <VersionChecker />
      <OnboardingModal />
      <Header currentInterface={currentInterface} language={language} />
      <InterfaceContainer currentInterface={currentInterface} />
    </div>
  );
};

export default memo(VoiceAssistant);
