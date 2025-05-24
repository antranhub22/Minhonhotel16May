import React, { useState } from 'react';
import { t, Lang } from '../i18n';
import { useAssistant } from '../context/AssistantContext';

interface InfographicStepsProps {
  currentStep?: number;
  compact?: boolean;
  horizontal?: boolean;
  language?: Lang;
}

export default function InfographicSteps({ currentStep = 1, compact = false, horizontal = false, language: propLanguage }: InfographicStepsProps) {
  const [showProgress, setShowProgress] = useState(false);
  // Lấy language từ prop hoặc context
  const { language: contextLanguage } = useAssistant ? useAssistant() : { language: 'en' };
  const language: Lang = (propLanguage || contextLanguage || 'en') as Lang;

const steps = [
  {
    icon: 'call',
    title: t('press_to_order', language),
    desc: t('press_to_call_desc', language),
  },
  {
    icon: 'check_circle',
    title: t('confirm_request', language),
    desc: t('confirm_request_desc', language),
  },
  {
    icon: 'mail',
    title: t('send_to_reception', language),
    desc: t('send_to_reception_desc', language),
  },
];

  // Responsive: mobile sẽ là dọc, icon nhỏ, chữ nhỏ
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Nếu là mobile và chưa show progress, chỉ hiển thị icon
  if (isMobile && !showProgress) {
    return (
      <div className="flex justify-center items-center mb-4">
        <button 
          onClick={() => setShowProgress(true)}
          className="flex items-center justify-center p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200"
        >
          <span className="material-icons text-2xl text-amber-400">info</span>
        </button>
      </div>
    );
  }

  if (horizontal) {
    return (
      <div className="flex flex-row items-center justify-center w-full gap-2 md:gap-6 py-1">
        {steps.map((step, idx) => (
          <React.Fragment key={step.title}>
            <div
              className={`flex flex-col items-center transition-all duration-300 ${
                idx + 1 === currentStep
                  ? 'opacity-100 scale-105'
                  : idx + 1 < currentStep
                  ? 'opacity-60'
                  : 'opacity-40'
              }`}
            >
              <div
                className={`flex items-center justify-center rounded-full shadow-lg mb-0.5 transition-all duration-300 ${
                  idx + 1 === currentStep
                    ? 'bg-[#d4af37] text-blue-900 border-2 border-[#d4af37]'
                    : 'bg-white/30 text-white border border-gray-200'
                }`}
                style={{
                  width: 22,
                  height: 22,
                  fontSize: 13,
                }}
              >
                <span className="material-icons">{step.icon}</span>
              </div>
              <div className="text-center">
                <div className={`font-semibold font-poppins mb-0 text-[10px] ${idx + 1 === currentStep ? 'text-white' : 'text-white/70'}`}>{step.title}</div>
                <div className="font-light text-[8px] text-white/80 hidden md:block">{step.desc}</div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="h-0.5 w-3 md:w-8 bg-gradient-to-r from-[#d4af37]/80 to-transparent mx-1 rounded-full" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
  // Dọc như cũ
  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/10 rounded-lg relative">
        {steps.map((step, idx) => (
          <div key={step.title} className="flex items-center gap-2">
            <span className="material-icons text-amber-400">{step.icon}</span>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{step.title}</h3>
              <p className="text-xs text-gray-600">{step.desc}</p>
            </div>
          </div>
        ))}
        {isMobile && showProgress && (
          <button 
            onClick={() => setShowProgress(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-pink-600"
          >
            <span className="material-icons">close</span>
          </button>
        )}
      </div>
    </div>
  );
} 