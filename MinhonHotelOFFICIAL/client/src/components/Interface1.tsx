// Interface1 component - latest version v1.0.1 
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '../assets/hotel-exterior.jpeg';
import { t } from '../i18n';
import { ActiveOrder, Language } from '@/types';
import { initVapi, getVapiInstance } from '@/lib/vapiClient';
import { FaGlobeAsia } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';

// Types
interface Interface1Props {
  isActive: boolean;
}

interface IconWithTooltipProps {
  iconName: string;
  className?: string;
  activeTooltip: string | null;
  onIconClick: (iconName: string) => void;
  language: Language;
}

interface LanguageSwitcherProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

interface MainCallButtonProps {
  language: Language;
  onCall: (lang: Language) => void;
}

// Memoized Components
const IconWithTooltip = memo(({ iconName, className, activeTooltip, onIconClick, language }: IconWithTooltipProps) => (
  <div className="relative flex flex-col items-center justify-center cursor-pointer">
    <span 
      className={`material-icons text-xl sm:text-4xl text-[#F9BF3B] ${className || ''}`} 
      style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
      onClick={() => onIconClick(iconName)}
    >
      {iconName}
    </span>
    
    {activeTooltip === iconName && (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[120px] sm:max-w-[180px] bg-white/90 text-gray-800 text-xs sm:text-sm font-medium py-1 px-2 rounded shadow-lg z-50 pointer-events-none text-center">
        {t(`icon_${iconName}`, language as Language)}
        <div className="absolute w-2 h-2 bg-white/90 transform rotate-45 left-1/2 -translate-x-1/2 top-full -mt-1"></div>
      </div>
    )}
  </div>
));

const LanguageSwitcher = memo(({ language, onLanguageChange }: LanguageSwitcherProps) => (
  <div className="flex items-center justify-center sm:justify-end w-full max-w-2xl mb-4 sm:mb-2">
    <button
      onClick={() => window.location.reload()}
      className="flex items-center justify-center mr-3 px-3 py-2 sm:py-1.5 bg-white/80 hover:bg-yellow-100 border border-amber-400 rounded-full shadow transition-all duration-200 text-blue-900 font-bold text-base sm:text-lg"
      style={{ minWidth: 40, minHeight: 40 }}
      title="Refresh"
    >
      <span className="material-icons text-xl sm:text-2xl mr-1 text-amber-400">refresh</span>
      <span className="hidden sm:inline font-semibold">Refresh</span>
      <span className="ml-2 text-xs sm:text-sm font-bold text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full align-middle">Demo</span>
    </button>
    <div className="flex items-center px-3 py-2 sm:py-1.5 gap-2 transition-all duration-300 mx-auto sm:mx-0" 
      style={{
        background: 'linear-gradient(135deg, #4e5ab7 0%, #3f51b5 100%)',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)', 
        borderRadius: '8px',
        minWidth: '150px',
        maxWidth: '95%',
        width: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
      <FaGlobeAsia className="text-[#F9BF3B] text-xl mr-1.5" 
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
      />
      <label className="mr-2 font-semibold font-sans text-white whitespace-nowrap text-sm sm:text-base">{t('language', language as Language)}:</label>
      <div className="relative flex-1">
        <select
          value={language}
          onChange={e => onLanguageChange(e.target.value as Language)}
          className="appearance-none w-full pl-6 sm:pl-8 pr-6 py-1 sm:py-1.5 font-sans bg-transparent focus:outline-none transition-all duration-200"
          style={{
            fontWeight: 600,
            color: '#fff',
            textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px'
          }}
        >
          <option value="en">🇬🇧 English</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="zh">🇨🇳 中文</option>
          <option value="ru">🇷🇺 Русский</option>
          <option value="ko">🇰🇷 한국어</option>
        </select>
        <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#F9BF3B] pointer-events-none text-lg" />
      </div>
    </div>
  </div>
));

const MainCallButton = memo(({ language, onCall }: MainCallButtonProps) => {
  const buttonStyle = useMemo(() => ({
    background: language === 'en' 
      ? 'linear-gradient(180deg, rgba(85,154,154,0.9) 0%, rgba(85,154,154,0.9) 100%)'
      : language === 'fr' 
      ? 'linear-gradient(180deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)'
      : language === 'zh' 
      ? 'linear-gradient(180deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)'
      : language === 'ru' 
      ? 'linear-gradient(180deg, rgba(79, 70, 229, 0.9) 0%, rgba(67, 56, 202, 0.9) 100%)'
      : 'linear-gradient(180deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)',
    boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25), 0px 6px 12px rgba(0, 0, 0, 0.15), inset 0px 1px 0px rgba(255, 255, 255, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    transition: 'all 0.3s ease',
    transform: 'translateY(0) translateZ(30px)',
  }), [language]);

  const iconColor = useMemo(() => 
    language === 'en' 
      ? '#F9BF3B'
      : language === 'fr' 
      ? '#FFFFFF'
      : language === 'zh' 
      ? '#FFEB3B'
      : language === 'ru' 
      ? '#F48FB1'
      : '#4ADE80'
  , [language]);

  return (
    <div className="relative mb-4 sm:mb-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-[ripple_1.5s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-80 opacity-60"></div>
      <div className="absolute inset-0 rounded-full border-4 border-amber-400/70 animate-[ripple_2s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-60 opacity-40"></div>
      <button 
        id={`vapiButton${language === 'en' ? 'En' : language === 'fr' ? 'Fr' : language === 'zh' ? 'Zh' : language === 'ru' ? 'Ru' : 'Ko'}`}
        className="group relative w-36 h-36 sm:w-40 sm:h-40 lg:w-56 lg:h-56 rounded-full font-poppins font-bold flex flex-col items-center justify-center overflow-hidden hover:translate-y-[-2px] hover:shadow-[0px_12px_20px_rgba(0,0,0,0.2)]"
        onClick={() => onCall(language as Language)}
        style={buttonStyle}
      >
        <span className="material-icons text-4xl sm:text-6xl lg:text-7xl mb-2 transition-all duration-300 group-hover:scale-110" 
          style={{ 
            filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))',
            color: iconColor
          }}
        >mic</span>
        <span className={`font-bold text-white px-2 text-center ${language === 'fr' ? 'text-sm sm:text-lg lg:text-2xl' : language === 'ru' || language === 'ko' ? 'text-sm sm:text-lg lg:text-xl' : 'text-lg sm:text-2xl lg:text-3xl'}`}
          style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
        >{t('press_to_call', language as Language)}</span>
        <span className="absolute w-full h-full rounded-full pointer-events-none"></span>
      </button>
    </div>
  );
});

const Interface1: React.FC<Interface1Props> = ({ isActive }) => {
  const { setCurrentInterface, setTranscripts, setModelOutput, setCallDetails, setCallDuration, setEmailSentForCurrentSession, activeOrders, language, setLanguage } = useAssistant();
  
  // State để lưu trữ tooltip đang hiển thị
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Track current time for countdown calculations
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hàm dùng chung cho mọi ngôn ngữ
  const handleCall = useCallback(async (lang: Language) => {
    setEmailSentForCurrentSession(false);
    setCallDetails({
      id: `call-${Date.now()}`,
      roomNumber: '',
      duration: '0',
      category: ''
    });
    setTranscripts([]);
    setModelOutput([]);
    setCallDuration(0);
    let publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    let assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;
    if (lang === 'fr') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_FR;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_FR;
    } else if (lang === 'zh') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_ZH;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_ZH;
    } else if (lang === 'ru') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_RU;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_RU;
    } else if (lang === 'ko') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_KO;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_KO;
    }
    const vapi = await initVapi(publicKey);
    if (vapi && assistantId) {
      await vapi.start(assistantId);
      setCurrentInterface('interface2');
    }
  }, [setCurrentInterface, setTranscripts, setModelOutput, setCallDetails, setCallDuration, setEmailSentForCurrentSession]);

  // Hàm xử lý khi click vào icon
  const handleIconClick = useCallback((iconName: string) => {
    // Nếu đang hiển thị tooltip cho icon này rồi thì ẩn đi, ngược lại thì hiển thị
    setActiveTooltip(activeTooltip === iconName ? null : iconName);
    
    // Tự động ẩn tooltip sau 3 giây
    if (activeTooltip !== iconName) {
      setTimeout(() => {
        setActiveTooltip(currentTooltip => currentTooltip === iconName ? null : currentTooltip);
      }, 3000);
    }
  }, [activeTooltip]);

  // Hàm để xác định màu sắc dựa trên trạng thái
  const getStatusColor = useCallback((status: string | undefined) => {
    if (!status) return 'bg-gray-300 text-gray-800';
    
    switch (status) {
      case 'Đã ghi nhận': return 'bg-gray-300 text-gray-800';
      case 'Đang thực hiện': return 'bg-yellow-200 text-yellow-800';
      case 'Đã thực hiện và đang bàn giao cho khách': return 'bg-blue-200 text-blue-800';
      case 'Hoàn thiện': return 'bg-green-200 text-green-800';
      case 'Lưu ý khác': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-300 text-gray-800';
    }
  }, []);

  // Hàm chuyển đổi trạng thái từ Staff UI sang key cho dịch thuật
  const getStatusTranslationKey = useCallback((status: string | undefined): string => {
    if (!status) return 'status_acknowledged';
    
    switch (status) {
      case 'Đã ghi nhận': return 'status_acknowledged';
      case 'Đang thực hiện': return 'status_in_progress'; 
      case 'Đã thực hiện và đang bàn giao cho khách': return 'status_delivering';
      case 'Hoàn thiện': return 'status_completed';
      case 'Lưu ý khác': return 'status_note';
      default: return 'status_acknowledged';
    }
  }, []);

  return (
    <div 
      className={`absolute w-full min-h-screen h-full transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } z-10 overflow-y-auto`} 
      id="interface1"
      style={{
        backgroundImage: `linear-gradient(rgba(26, 35, 126, 0.7), rgba(121, 219, 220, 0.6)), url('/Pool_View2.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        perspective: '1000px'
      }}
    >
      <div className="container mx-auto flex flex-col items-center justify-start text-white p-3 pt-6 sm:p-5 sm:pt-10 lg:pt-16 overflow-visible pb-32 sm:pb-24" 
        style={{ transform: 'translateZ(20px)', minHeight: 'fit-content' }}
      >
        <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
        <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-amber-400 mb-2 text-center"
          style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}>{t('hotel_name', language as Language)}</h2>
        <p className="text-xs sm:text-lg lg:text-xl text-center max-w-full mb-4 truncate sm:whitespace-nowrap overflow-x-auto">{t('hotel_subtitle', language as Language)}</p>
        
        <MainCallButton language={language} onCall={handleCall} />
        
        {/* Services Section - với hiệu ứng Glass Morphism và 3D */}
        <div className="text-center w-full max-w-5xl mb-10 sm:mb-8" style={{ perspective: '1000px' }}>
          <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-y-2 sm:gap-y-2 md:gap-3 text-left mx-auto w-full">
            {/* Room & Stay */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-2 sm:mb-0 min-h-[36px] transition-all duration-250 hover:scale-103 hover:-translate-y-1"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >{t('room_and_stay', language as Language)}</h4>
              <ul className="grid grid-cols-5 gap-0 sm:gap-2 py-0.5 sm:py-2">
                <li><IconWithTooltip iconName="login" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="hourglass_empty" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="info" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="policy" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="wifi" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
              </ul>
            </div>
            {/* Room Services - Áp dụng cùng phong cách cho các panel khác */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-2 sm:mb-0 min-h-[36px] transition-all duration-250 hover:scale-103 hover:-translate-y-1"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >{t('room_services', language as Language)}</h4>
              <ul className="grid grid-cols-7 gap-0 sm:gap-2 py-0.5 sm:py-2">
                <li><IconWithTooltip iconName="restaurant" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="local_bar" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="cleaning_services" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="local_laundry_service" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="alarm" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="add_circle" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="build" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
              </ul>
            </div>
            {/* Bookings & Facilities */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-2 sm:mb-0 min-h-[36px] transition-all duration-250 hover:scale-103 hover:-translate-y-1"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >{t('bookings_and_facilities', language as Language)}</h4>
              <ul className="grid grid-cols-7 gap-0 sm:gap-2 py-0.5 sm:py-2">
                <li><IconWithTooltip iconName="event_seat" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="spa" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="fitness_center" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="pool" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="directions_car" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="medical_services" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="support_agent" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
              </ul>
            </div>
            {/* Tourism & Exploration */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-2 sm:mb-0 min-h-[36px] transition-all duration-250 hover:scale-103 hover:-translate-y-1"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >{t('tourism_and_exploration', language as Language)}</h4>
              <ul className="grid grid-cols-7 gap-0 sm:gap-2 py-0.5 sm:py-2">
                <li><IconWithTooltip iconName="location_on" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="local_dining" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="directions_bus" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="directions_car" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="event" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="shopping_bag" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="map" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
              </ul>
            </div>
            {/* Support */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-4 sm:mb-0 min-h-[36px] transition-all duration-250 hover:scale-103 hover:-translate-y-1"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >{t('support_external_services', language as Language)}</h4>
              <ul className="grid grid-cols-4 gap-0 sm:gap-2 py-0.5 sm:py-2">
                <li><IconWithTooltip iconName="translate" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="rate_review" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="report_problem" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
                <li><IconWithTooltip iconName="luggage" className="text-xl" activeTooltip={activeTooltip} onIconClick={handleIconClick} language={language} /></li>
              </ul>
            </div>
          </div>
        </div>
        {/* Active orders status panels - thêm hiệu ứng 3D và đường viền sáng */}
        {activeOrders && activeOrders.length > 0 && (
          <div className="flex flex-col items-center gap-y-4 mb-20 pb-16 w-full px-2 sm:mb-12 sm:pb-8 sm:flex-row sm:flex-nowrap sm:gap-x-4 sm:overflow-x-auto sm:justify-start"
            style={{ perspective: '1000px', zIndex: 30 }}
          >
            {[...activeOrders].sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()).map((o: ActiveOrder) => {
              const deadline = new Date(o.requestedAt.getTime() + 60 * 60 * 1000);
              const diffSec = Math.max(Math.ceil((deadline.getTime() - now.getTime()) / 1000), 0);
              if (diffSec <= 0) return null;
              const mins = Math.floor(diffSec / 60).toString().padStart(2, '0');
              const secs = (diffSec % 60).toString().padStart(2, '0');
              return (
                <div key={o.reference} 
                  className="p-2 sm:p-3 text-gray-800 max-w-xs w-[220px] flex-shrink-0 transition-all duration-250 hover:rotate-1 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '24px',
                    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    transform: 'translateZ(20px)',
                    transformStyle: 'preserve-3d',
                    zIndex: 20,
                    marginBottom: '8px',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  {/* Đồng hồ đếm ngược ở trên đầu */}
                  <div className="flex justify-center items-center mb-1.5">
                    <span className="font-bold text-lg text-blue-800 bg-blue-50 px-4 py-1.5 rounded-full shadow-sm" 
                      style={{
                        borderRadius: '16px',
                        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    >{`${mins}:${secs}`}</span>
                  </div>
                  
                  <p className="text-xs sm:text-sm mb-0.5 px-1.5"><strong>{t('order_ref', language as Language)}:</strong> {o.reference}</p>
                  <p className="text-xs sm:text-sm mb-0.5 px-1.5"><strong>{t('requested_at', language as Language)}:</strong> {o.requestedAt.toLocaleString('en-US', {timeZone: 'Asia/Ho_Chi_Minh', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="text-xs sm:text-sm mb-0.5 px-1.5"><strong>{t('estimated_completion', language as Language)}:</strong> {o.estimatedTime}</p>
                  
                  {/* Thêm trạng thái - hiển thị theo ngôn ngữ đã chọn */}
                  <div className="mt-2 flex justify-center">
                    <span className={`px-2 py-1 text-xs font-semibold ${getStatusColor(o.status)} w-full text-center`}
                      style={{
                        borderRadius: '16px',
                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {t(getStatusTranslationKey(o.status), language as Language)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Interface1);
