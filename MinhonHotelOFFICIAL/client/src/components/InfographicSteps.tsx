import React, { memo, useMemo } from 'react';
import { t } from '../i18n';
import { useAssistant } from '../context/AssistantContext';
import { Language } from '@/types';

interface InfographicStepsProps {
  currentStep?: number;
  compact?: boolean;
  horizontal?: boolean;
  language?: Language;
}

interface StepProps {
  step: {
    icon: string;
    title: string;
    desc: string;
  };
  index: number;
  currentStep: number;
  compact?: boolean;
  horizontal?: boolean;
}

const Step = memo(({ step, index, currentStep, compact, horizontal }: StepProps) => {
  const isActive = index + 1 === currentStep;
  const isCompleted = index + 1 < currentStep;
  
  const iconStyle = useMemo(() => ({
    width: horizontal ? 22 : (compact ? 32 : 48),
    height: horizontal ? 22 : (compact ? 32 : 48),
    fontSize: horizontal ? 13 : (compact ? 18 : 28),
  }), [horizontal, compact]);
  
  const iconClasses = useMemo(() => `
    flex items-center justify-center rounded-full shadow-lg transition-all duration-300
    ${isActive 
      ? 'bg-[#d4af37] text-blue-900 border-2 border-[#d4af37]' 
      : 'bg-white/30 text-white border border-gray-200'
    }
  `, [isActive]);
  
  const titleClasses = useMemo(() => `
    font-semibold font-poppins mb-1
    ${horizontal ? 'text-[10px]' : (compact ? 'text-xs' : 'text-base')}
    ${isActive ? 'text-white' : 'text-white/70'}
  `, [horizontal, compact, isActive]);
  
  const descClasses = useMemo(() => `
    font-light
    ${horizontal ? 'text-[8px]' : (compact ? 'text-[10px]' : 'text-sm')}
    text-white/80
    ${horizontal ? 'hidden md:block' : ''}
  `, [horizontal, compact]);
  
  const containerClasses = useMemo(() => `
    flex flex-col items-center transition-all duration-300
    ${isActive ? 'opacity-100 scale-105' : isCompleted ? 'opacity-60' : 'opacity-40'}
    ${horizontal ? 'w-auto' : 'w-full'}
  `, [isActive, isCompleted, horizontal]);
  
  return (
    <div className={containerClasses}>
      <div className={iconClasses} style={iconStyle}>
        <span className="material-icons" aria-hidden="true">{step.icon}</span>
      </div>
      <div className="text-center">
        <div className={titleClasses}>{step.title}</div>
        <div className={descClasses}>{step.desc}</div>
      </div>
    </div>
  );
});

const InfographicSteps = memo(({ currentStep = 1, compact = false, horizontal = false, language: propLanguage }: InfographicStepsProps) => {
  const { language: contextLanguage } = useAssistant ? useAssistant() : { language: 'en' };
  const language: Language = (propLanguage || contextLanguage || 'en') as Language;

  const steps = useMemo(() => [
    {
      icon: 'call',
      title: t('press_to_call', language),
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
  ], [language]);

  if (horizontal) {
    return (
      <div 
        className="flex flex-row items-center justify-center w-full gap-2 md:gap-6 py-1"
        role="list"
        aria-label={t('process_steps', language as Language)}
      >
        {steps.map((step, idx) => (
          <React.Fragment key={step.title}>
            <div role="listitem" aria-current={idx + 1 === currentStep ? 'step' : undefined}>
              <Step
                step={step}
                index={idx}
                currentStep={currentStep}
                horizontal={horizontal}
              />
            </div>
            {idx < steps.length - 1 && (
              <div 
                className="h-0.5 w-3 md:w-8 bg-gradient-to-r from-[#d4af37]/80 to-transparent mx-1 rounded-full"
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`w-full ${compact ? 'max-w-[160px] py-2 gap-3' : 'max-w-xs py-6 gap-6'} mx-auto flex flex-col items-center`}
      role="list"
      aria-label={t('process_steps', language as Language)}
    >
      {steps.map((step, idx) => (
        <div key={step.title} role="listitem" aria-current={idx + 1 === currentStep ? 'step' : undefined}>
          <Step
            step={step}
            index={idx}
            currentStep={currentStep}
            compact={compact}
          />
          {idx < steps.length - 1 && (
            <div 
              className={`mx-auto my-1 rounded-full ${compact ? 'w-0.5 h-4' : 'w-1 h-8'} bg-gradient-to-b from-[#d4af37]/80 to-transparent`}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
});

export default InfographicSteps; 