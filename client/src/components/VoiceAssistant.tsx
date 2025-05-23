import React from 'react';
import { useAssistant } from '@/context/AssistantContext';
import Interface1 from './Interface1';
import Interface2 from './Interface2';
import Interface3 from './Interface3';
import Interface3Vi from './Interface3Vi';
import Interface3Fr from './Interface3Fr';
import Interface4 from './Interface4';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Link } from 'wouter';
import { History } from 'lucide-react';
import InfographicSteps from './InfographicSteps';

const VoiceAssistant: React.FC = () => {
  const { currentInterface, language } = useAssistant();
  
  // Initialize WebSocket connection
  useWebSocket();

  return (
    <div className="relative h-screen overflow-hidden font-sans text-gray-800 bg-neutral-50" id="app">
      {/* Header Bar */}
      <header className="w-full bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between px-2">
          {/* Left: Logo */}
          <div className="w-24 flex-shrink-0 flex items-center justify-start ml-1 sm:ml-4 mr-2 sm:mr-6">
            <img src="/assets/references/images/haily-logo1.jpg" alt="Haily Logo" className="h-16 sm:h-20 w-auto rounded-lg shadow-md bg-white/80 p-1" />
          </div>
          {/* Center: HaiLy Travel brand name - chỉ hiện trên mobile */}
          <div className="flex-1 flex justify-center sm:hidden">
            <span className="font-extrabold text-xl tracking-wide select-none" style={{
              background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 8px rgba(0,0,0,0.18)',
              letterSpacing: '0.04em',
              fontFamily: 'Poppins, sans-serif',
              padding: '0 0.5rem',
              borderRadius: '8px',
              lineHeight: 1.1
            }}>
              <span style={{color: '#FFD700', WebkitTextFillColor: '#FFD700'}}>HaiLy</span> <span style={{color: '#fff', WebkitTextFillColor: '#fff'}}>Travel</span>
            </span>
          </div>
          {/* Right: Call History */}
          <div className="w-10 flex-shrink-0 flex items-center justify-end ml-2 sm:ml-6 mr-1 sm:mr-2">
            <Link href="/call-history">
              <a className="flex items-center gap-1 px-2 py-1 rounded bg-primary-dark text-white text-xs sm:text-sm">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Call History</span>
              </a>
            </Link>
          </div>
          {/* Nút Infor ở giữa TopBar */}
          <div className="hidden sm:flex items-center justify-center ..."> 
            {/* ...icon info... */}
          </div>
        </div>
      </header>

      {/* Interface Layers Container */}
      <div className="relative w-full h-full" id="interfaceContainer">
        <Interface1 
          isActive={currentInterface === 'interface1'} 
        />
        <Interface2 
          isActive={currentInterface === 'interface2'} 
        />
        <Interface3 
          isActive={currentInterface === 'interface3'} 
        />
        <Interface3Vi 
          isActive={currentInterface === 'interface3vi'} 
        />
        <Interface3Fr 
          isActive={currentInterface === 'interface3fr'} 
        />
        <Interface4 
          isActive={currentInterface === 'interface4'} 
        />
      </div>
    </div>
  );
};

export default VoiceAssistant;
