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
    <div className="relative min-h-screen flex flex-col font-sans" style={{background: 'linear-gradient(135deg, #23255d 0%, #3a3e8e 50%, #5b5fd6 100%)'}}>
      {/* Header */}
      <header className="w-full flex items-center justify-between px-4 pt-6 pb-3">
        {/* Menu icon */}
        <button className="bg-card-bg rounded-full p-2 shadow" style={{boxShadow: 'var(--card-shadow)'}}>
          <span className="material-icons text-white text-2xl">menu</span>
        </button>
        {/* Location icon */}
        <button className="bg-card-bg rounded-full p-2 mx-2 shadow" style={{boxShadow: 'var(--card-shadow)'}}>
          <span className="material-icons text-white text-2xl">location_on</span>
        </button>
        {/* Avatar user */}
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent-yellow flex items-center justify-center">
          <img src="/assets/references/images/haily-logo1.jpg" alt="User Avatar" className="object-cover w-full h-full" />
        </div>
      </header>

      {/* Tiêu đề lớn */}
      <div className="px-6 pt-2 pb-4">
        <h1 className="text-3xl font-bold text-white mb-1" style={{fontFamily: 'var(--font-main)'}}>Simplify</h1>
        <h2 className="text-xl italic text-gray-200" style={{fontFamily: 'var(--font-main)'}}>Your Travels</h2>
      </div>

      {/* Thanh chọn package */}
      <div className="flex flex-row gap-2 px-4 pb-3 overflow-x-auto">
        <button className="px-4 py-2 rounded-full font-semibold bg-[var(--accent-yellow)] text-black shadow">All Package</button>
        <button className="px-4 py-2 rounded-full font-semibold bg-card-bg text-white shadow">Flight Package</button>
        <button className="px-4 py-2 rounded-full font-semibold bg-card-bg text-white shadow">Hotel Package</button>
        <button className="px-4 py-2 rounded-full font-semibold bg-card-bg text-white shadow">Tour Package</button>
      </div>

      {/* Danh sách card dịch vụ (placeholder) */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        <div className="bg-card-bg rounded-3xl shadow-lg p-4 mb-6" style={{boxShadow: 'var(--card-shadow)'}}>
          <div className="h-40 bg-gray-700 rounded-2xl mb-3"></div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[var(--accent-yellow)] text-black text-xs font-bold px-2 py-1 rounded-full">Tour Package</span>
            <span className="bg-card-bg text-white text-xs font-bold px-2 py-1 rounded-full">3 Days</span>
            <span className="bg-card-bg text-white text-xs font-bold px-2 py-1 rounded-full">AI</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Sea Pearl Beach Resort & Spa</h3>
          <p className="text-gray-300 text-sm mb-2">Inani, cox's bazar</p>
          <div className="flex items-center justify-between">
            <button className="bg-[var(--accent-yellow)] rounded-full p-2 shadow">
              <span className="material-icons text-black text-xl">arrow_outward</span>
            </button>
            <button className="bg-card-bg rounded-full p-2 shadow">
              <span className="material-icons text-white text-xl">favorite_border</span>
            </button>
          </div>
        </div>
        {/* Thêm nhiều card placeholder nếu muốn */}
      </div>

      {/* Thanh điều hướng dưới */}
      <nav className="fixed bottom-0 left-0 w-full flex items-center justify-around bg-card-bg py-3 px-6 rounded-t-3xl shadow-2xl" style={{boxShadow: 'var(--card-shadow)'}}>
        <button className="flex flex-col items-center">
          <span className="material-icons text-white text-2xl">home</span>
        </button>
        <button className="flex flex-col items-center bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] px-6 py-2 rounded-full shadow-lg" style={{boxShadow: 'var(--card-shadow)'}}>
          <span className="material-icons text-white text-2xl">smart_toy</span>
          <span className="text-xs text-white font-semibold mt-1">Chat With AI</span>
        </button>
        <button className="flex flex-col items-center">
          <span className="material-icons text-white text-2xl">bookmark_border</span>
        </button>
      </nav>
    </div>
  );
};

export default VoiceAssistant;
