import React, { memo, useCallback, useEffect, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { t } from '@/i18n';
import { Language } from '@/types';

interface Interface4Props {
  isActive: boolean;
}

interface SuccessAnimationProps {
  isVisible: boolean;
}

interface OrderInfoProps {
  order: {
    reference: string;
    estimatedTime: string;
  };
  language: Language;
}

// Memoized Components
const SuccessAnimation = memo(({ isVisible }: SuccessAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div className="mb-4 sm:mb-6 flex justify-center">
      <div 
        className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-green-500 flex items-center justify-center transition-all duration-500 ${
          isAnimating ? 'scale-110' : 'scale-100'
        }`}
      >
        <span className="material-icons text-white text-4xl sm:text-5xl">check</span>
      </div>
    </div>
  );
});

const OrderInfo = memo(({ order, language }: OrderInfoProps) => {
  return (
    <>
      <div className="bg-neutral p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
        <p className="font-medium text-gray-800 text-sm sm:text-base">
          {t('order_reference', language as Language)}: <span className="font-bold">{order.reference}</span>
        </p>
      </div>
      <div className="mb-4 sm:mb-6">
        <p className="text-gray-600 text-xs sm:text-sm">{t('estimated_delivery_time', language as Language)}</p>
        <p className="font-poppins font-bold text-lg sm:text-xl">{order.estimatedTime}</p>
      </div>
    </>
  );
});

const Interface4: React.FC<Interface4Props> = ({ isActive }) => {
  const { order, setCurrentInterface, language } = useAssistant();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);
  
  const handleReturnHome = useCallback(() => {
    setCurrentInterface('interface1');
  }, [setCurrentInterface]);
  
  if (!order) return null;
  
  return (
    <div 
      className={`absolute w-full h-full transition-all duration-500 ${
        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      } bg-neutral z-40`} 
      id="interface4"
      role="dialog"
      aria-labelledby="order-confirmation-title"
    >
      <div className="container mx-auto h-full flex flex-col items-center justify-center p-3 sm:p-5 text-center">
        <div 
          className={`w-full max-w-xs sm:max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-8 transition-all duration-500 ${
            isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <SuccessAnimation isVisible={isActive} />
          
          <h2 
            id="order-confirmation-title"
            className="font-poppins font-bold text-xl sm:text-2xl text-primary mb-2 sm:mb-3"
          >
            {t('order_confirmed', language as Language)}
          </h2>
          
          <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
            {t('order_confirmed_message', language as Language)}
          </p>
          
          <OrderInfo order={order} language={language as Language} />
          
          <button 
            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-amber-400 text-primary-dark rounded-lg font-poppins font-medium text-sm sm:text-base hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            onClick={handleReturnHome}
            aria-label={t('return_to_home', language as Language)}
          >
            {t('return_to_home', language as Language)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(Interface4);
