// Interface1 component - latest version v1.0.1 
import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '../assets/hotel-exterior.jpeg';
import { t, Lang } from '../i18n';
import { ActiveOrder } from '@/types';
import { initVapi, getVapiInstance } from '@/lib/vapiClient';
import { FaGlobeAsia } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import Reference from '@/components/Reference';
import { referenceService, ReferenceItem } from '@/services/ReferenceService';
import { iconMediaMap, IconMedia } from '../assets/iconMediaMap';
import { FaMountain, FaCarSide, FaUmbrellaBeach, FaStar, FaBusAlt, FaRoute, FaMotorcycle, FaTaxi, FaMoneyBillWave, FaEuroSign, FaPoundSign, FaYenSign, FaRubleSign, FaExchangeAlt, FaBitcoin, FaTshirt, FaSoap, FaBolt, FaPlus, FaHome, FaBuilding, FaCalendarAlt, FaPlusSquare } from 'react-icons/fa';

interface Interface1Props {
  isActive: boolean;
}

const Interface1: React.FC<Interface1Props> = ({ isActive }) => {
  const { setCurrentInterface, setTranscripts, setModelOutput, setCallDetails, setCallDuration, setEmailSentForCurrentSession, activeOrders, language, setLanguage } = useAssistant();
  const lang: Lang = language as Lang;
  
  // State để lưu trữ tooltip đang hiển thị
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Track current time for countdown calculations
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [references, setReferences] = useState<ReferenceItem[]>([]);
  useEffect(() => {
    async function loadAllReferences() {
      await referenceService.initialize();
      const allRefs = Object.values((referenceService as any).referenceMap || {}) as ReferenceItem[];
      setReferences(allRefs);
    }
    loadAllReferences();
  }, []);

  const [activeIcon, setActiveIcon] = useState<string | null>(null);

  // Tạo object ánh xạ iconName -> React component icon sát nghĩa nhất
  const iconComponents: Record<string, JSX.Element> = {
    // TOURISM & TOURS
    sand_dunes: <FaMountain size={32} color="#F9BF3B" />, // Đồi cát (fallback)
    sightseeing: <FaMountain size={32} color="#F9BF3B" />, // Phan Thiet Sightseeing
    jeep_tour: <FaCarSide size={32} color="#F9BF3B" />, // Jeep Tour
    stream_beach: <FaUmbrellaBeach size={32} color="#F9BF3B" />, // Stream and Beach
    special_tour: <FaStar size={32} color="#F9BF3B" />, // Special Tours
    // BUS TICKETS
    bus_hcm: <FaBusAlt size={32} color="#F9BF3B" />,
    bus_dl: <FaBusAlt size={32} color="#F9BF3B" />,
    bus_nt: <FaBusAlt size={32} color="#F9BF3B" />,
    bus_other: <FaRoute size={32} color="#F9BF3B" />,
    // VEHICLE RENTAL
    motorcycle: <FaMotorcycle size={32} color="#F9BF3B" />,
    car_driver: <FaTaxi size={32} color="#F9BF3B" />,
    car_self: <FaCarSide size={32} color="#F9BF3B" />,
    vehicle_special: <FaCarSide size={32} color="#F9BF3B" />,
    // CURRENCY EXCHANGE
    usd: <FaMoneyBillWave size={32} color="#F9BF3B" />,
    eur: <FaEuroSign size={32} color="#F9BF3B" />,
    gbp: <FaPoundSign size={32} color="#F9BF3B" />,
    jpy: <FaYenSign size={32} color="#F9BF3B" />,
    rub: <FaRubleSign size={32} color="#F9BF3B" />,
    currency_exchange: <FaExchangeAlt size={32} color="#F9BF3B" />,
    currency_other: <FaBitcoin size={32} color="#F9BF3B" />,
    // LAUNDRY SERVICE
    laundry_regular: <FaTshirt size={32} color="#F9BF3B" />,
    laundry_special: <FaSoap size={32} color="#F9BF3B" />,
    laundry_express: <FaBolt size={32} color="#F9BF3B" />,
    laundry_additional: <FaPlus size={32} color="#F9BF3B" />,
    // HOMESTAY SERVICE
    homestay_300k: <FaHome size={32} color="#F9BF3B" />,
    homestay_300_600k: <FaHome size={32} color="#F9BF3B" />,
    homestay_600k: <FaBuilding size={32} color="#F9BF3B" />,
    homestay_longterm: <FaCalendarAlt size={32} color="#F9BF3B" />,
    homestay_additional: <FaPlusSquare size={32} color="#F9BF3B" />,
  };

  // Thêm object ánh xạ iconName -> tên dịch vụ đúng chuẩn:
  const iconDisplayNames: Record<string, string> = {
    // TOURISM & TOURS
    flag: 'Sand Dunes',
    location_city: 'Phan Thiet Sightseeing',
    directions_car: 'Jeep Tour',
    waves: 'Stream and Beach',
    star: 'Special Tours',
    // BUS TICKETS
    directions_bus: 'Mui Ne - Ho Chi Minh City Route',
    directions_bus_filled: 'Mui Ne - Da Lat Route',
    directions: 'Mui Ne - Nha Trang Route',
    alt_route: 'Other Routes',
    // VEHICLE RENTAL
    two_wheeler: 'Motorcycle Rental',
    local_taxi: 'Car Rental (with driver)',
    airport_shuttle: 'Special Vehicle Rental',
    // CURRENCY EXCHANGE
    attach_money: 'USD (US Dollar)',
    euro: 'EUR (Euro)',
    currency_pound: 'GBP (British Pound)',
    currency_yen: 'JPY (Japanese Yen)',
    currency_ruble: 'RUB (Russian Ruble)',
    currency_exchange: 'Additional Currency Services',
    currency_bitcoin: 'Additional Currency Services',
    // LAUNDRY SERVICE
    local_laundry_service: 'Regular Laundry Service',
    dry_cleaning: 'Special Laundry Service',
    bolt: 'Express Laundry Service',
    add: 'Additional Laundry Services',
    // HOMESTAY SERVICE
    home: 'Price Range/day: < 300k',
    home_work: 'Price Range/day: 300k - 600k',
    villa: 'Price Range/day: Above 600k',
    event_repeat: 'Long-term Rental',
    add_home: 'Additional Homestay Services',
  };

  // Hàm dùng chung cho mọi ngôn ngữ
  const handleCall = async (lang: 'en' | 'fr' | 'zh' | 'ru' | 'ko') => {
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
  };

  // Khi nhấn icon, set activeIcon (nếu nhấn lại icon đang chọn thì bỏ chọn)
  const handleIconClick = (iconName: string) => {
    setActiveIcon(prev => prev === iconName ? null : iconName);
    // Nếu đang hiển thị tooltip cho icon này rồi thì ẩn đi, ngược lại thì hiển thị
    setActiveTooltip(activeTooltip === iconName ? null : iconName);
    
    // Tự động ẩn tooltip sau 3 giây
    if (activeTooltip !== iconName) {
      setTimeout(() => {
        setActiveTooltip(currentTooltip => currentTooltip === iconName ? null : currentTooltip);
      }, 3000);
    }
  };

  // Hàm truyền vào Reference để đóng media động
  const handleCloseMedia = () => setActiveIcon(null);

  // Lấy media động tương ứng nếu có
  const activeIconMedia = activeIcon && iconMediaMap[activeIcon]
    ? { ...iconMediaMap[activeIcon], onClose: handleCloseMedia }
    : null;

  // Component hiển thị icon với tooltip
  const IconWithTooltip = ({ iconName, className }: { iconName: string, className?: string }) => (
    <div className="relative flex flex-col items-center justify-center cursor-pointer">
      <span 
        className={`material-icons text-xl sm:text-4xl text-[#F9BF3B] ${className || ''}`} 
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
        onClick={() => handleIconClick(iconName)}
      >
        {iconName}
      </span>
      
      {activeTooltip === iconName && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[120px] sm:max-w-[180px] bg-white/90 text-gray-800 text-xs sm:text-sm font-medium py-1 px-2 rounded shadow-lg z-50 pointer-events-none text-center">
          {iconDisplayNames[iconName] || iconName}
          <div className="absolute w-2 h-2 bg-white/90 transform rotate-45 left-1/2 -translate-x-1/2 top-full -mt-1"></div>
        </div>
      )}
    </div>
  );

  // Hàm để xác định màu sắc và icon dựa trên trạng thái
  const getStatusStyle = (status: string | undefined) => {
    if (!status) return { bg: 'bg-gray-300', text: 'text-gray-800', icon: 'info' };
    switch (status) {
      case 'Đã ghi nhận':
        return { bg: 'bg-gray-300', text: 'text-gray-800', icon: 'assignment_turned_in' };
      case 'Đang thực hiện':
        return { bg: 'bg-yellow-400', text: 'text-yellow-900', icon: 'autorenew' };
      case 'Đã thực hiện và đang bàn giao cho khách':
        return { bg: 'bg-blue-400', text: 'text-blue-900', icon: 'local_shipping' };
      case 'Hoàn thiện':
        return { bg: 'bg-green-500', text: 'text-white', icon: 'check_circle' };
      case 'Lưu ý khác':
        return { bg: 'bg-red-400', text: 'text-white', icon: 'error' };
      default:
        return { bg: 'bg-gray-300', text: 'text-gray-800', icon: 'info' };
    }
  };

  // Hàm chuyển đổi trạng thái từ Staff UI sang key cho dịch thuật
  const getStatusTranslationKey = (status: string | undefined): string => {
    if (!status) return 'status_acknowledged';
    const normalized = status.trim().toLowerCase();
    if (normalized.includes('đã ghi nhận') || normalized.includes('acknowledged')) return 'status_acknowledged';
    if (normalized.includes('đang thực hiện') || normalized.includes('in progress')) return 'status_in_progress';
    if (normalized.includes('bàn giao') || normalized.includes('delivering')) return 'status_delivering';
    if (normalized.includes('hoàn thiện') || normalized.includes('completed')) return 'status_completed';
    if (normalized.includes('lưu ý') || normalized.includes('note')) return 'status_note';
    return 'status_acknowledged';
  };

  // Log dữ liệu order thực tế để debug
  console.log('ActiveOrders:', activeOrders);

  return (
    <div 
      className={`absolute w-full min-h-screen h-full transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } z-10 overflow-y-auto`} 
      id="interface1"
      style={{
        backgroundImage: `linear-gradient(rgba(26, 35, 126, 0.7), rgba(121, 219, 220, 0.6)), url(${hotelImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        perspective: '1000px'
      }}
    >
      <div className="container mx-auto flex flex-col items-center justify-start text-white p-3 pt-6 sm:p-5 sm:pt-10 lg:pt-16 overflow-visible pb-32 sm:pb-24" 
        style={{ transform: 'translateZ(20px)', minHeight: 'fit-content' }}
      >
        {/* Language Switcher nâng cao */}
        <div className="flex items-center justify-center sm:justify-end w-full max-w-2xl mb-4 sm:mb-2">
          {/* Nút Refresh bên trái */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center mr-3 px-3 py-2 sm:py-1.5 bg-white/80 hover:bg-yellow-100 border border-amber-400 rounded-full shadow transition-all duration-200 text-blue-900 font-bold text-base sm:text-lg"
            style={{ minWidth: 40, minHeight: 40 }}
            title="Refresh"
          >
            <span className="material-icons text-xl sm:text-2xl mr-1 text-amber-400">refresh</span>
            <span className="hidden sm:inline font-semibold">Refresh</span>
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
            <label className="mr-2 font-semibold font-sans text-white whitespace-nowrap text-sm sm:text-base">{t('language', lang)}:</label>
            <div className="relative flex-1">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as 'en' | 'fr' | 'zh' | 'ru' | 'ko')}
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
        <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-amber-400 mb-2 text-center"
          style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}>
          <span style={{ color: 'red', fontStyle: 'italic', marginRight: 8 }}>Demo</span>{t('hotel_name', lang)}
        </h2>
        <p className="text-xs sm:text-lg lg:text-xl text-center max-w-full mb-4 truncate sm:whitespace-nowrap overflow-x-auto">AI-powered Voice Assistant - Supporting All Your Needs</p>
        <Reference references={references} activeIconMedia={activeIconMedia} />
        
        {/* Main Call Button với hiệu ứng nâng cao */}
        <div className="relative mb-4 sm:mb-12 flex items-center justify-center">
          {/* Ripple Animation (luôn hiển thị, mạnh hơn khi hover) */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-[ripple_1.5s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-80 opacity-60"></div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/70 animate-[ripple_2s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-60 opacity-40"></div>
          {/* Main Button */}
            <button 
            id={`vapiButton${lang === 'en' ? 'En' : lang === 'fr' ? 'Fr' : lang === 'zh' ? 'Zh' : lang === 'ru' ? 'Ru' : 'Ko'}`}
            className="group relative w-36 h-36 sm:w-40 sm:h-40 lg:w-56 lg:h-56 rounded-full font-poppins font-bold flex flex-col items-center justify-center overflow-hidden hover:translate-y-[-2px] hover:shadow-[0px_12px_20px_rgba(0,0,0,0.2)]"
            onClick={() => handleCall(lang as any)}
            style={{
              background: lang === 'en' 
                ? 'linear-gradient(180deg, rgba(85,154,154,0.9) 0%, rgba(85,154,154,0.9) 100%)' // Tiếng Anh - Blue Lagoon
                : lang === 'fr' 
                ? 'linear-gradient(180deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)' // Tiếng Pháp - Xanh da trời
                : lang === 'zh' 
                ? 'linear-gradient(180deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)' // Tiếng Trung - Đỏ
                : lang === 'ru' 
                ? 'linear-gradient(180deg, rgba(79, 70, 229, 0.9) 0%, rgba(67, 56, 202, 0.9) 100%)' // Tiếng Nga - Tím
                : 'linear-gradient(180deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)', // Tiếng Hàn - Xanh lá
              boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25), 0px 6px 12px rgba(0, 0, 0, 0.15), inset 0px 1px 0px rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0) translateZ(30px)',
            }}
          >
            <span className="material-icons text-4xl sm:text-6xl lg:text-7xl mb-2 text-[#F9BF3B] transition-all duration-300 group-hover:scale-110" 
              style={{ 
                filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))',
                color: lang === 'en' 
                  ? '#F9BF3B' // Vàng cho tiếng Anh
                  : lang === 'fr' 
                  ? '#FFFFFF' // Trắng cho tiếng Pháp
                  : lang === 'zh' 
                  ? '#FFEB3B' // Vàng sáng cho tiếng Trung
                  : lang === 'ru' 
                  ? '#F48FB1' // Hồng nhạt cho tiếng Nga
                  : '#4ADE80' // Xanh lá sáng cho tiếng Hàn
              }}
            >mic</span>
            {lang === 'fr' ? (
              <span className="text-sm sm:text-lg lg:text-2xl font-bold text-white px-2 text-center"
                style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >{t('press_to_call', lang)}</span>
            ) : lang === 'ru' || lang === 'ko' ? (
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-white px-2 text-center"
                style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >{t('press_to_call', lang)}</span>
            ) : (
              <span className="text-lg sm:text-2xl lg:text-3xl font-bold whitespace-nowrap text-white"
                style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >{t('press_to_call', lang)}</span>
            )}
            <span className="absolute w-full h-full rounded-full pointer-events-none"></span>
            </button>
        </div>
        {/* Services Section - với hiệu ứng Glass Morphism và 3D */}
        <div className="text-center w-full max-w-5xl mb-10 sm:mb-8" style={{ perspective: '1000px' }}>
          <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-y-2 sm:gap-y-2 md:gap-3 text-left mx-auto w-full">
            {/* 1. TOUR DU LỊCH */}
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
              >{t('tourism_tour', lang)}</h4>
              <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 py-2">
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="sand_dunes" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="sightseeing" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="jeep_tour" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="stream_beach" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="special_tour" /></li>
              </ul>
            </div>
            {/* 2. VÉ XE KHÁCH */}
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
              >{t('ticket_bus', lang)}</h4>
              <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 py-2">
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="bus_hcm" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="bus_dl" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="bus_nt" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="bus_other" /></li>
              </ul>
            </div>
            {/* 3. DỊCH VỤ CHO THUÊ PHƯƠNG TIỆN */}
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
              >{t('rental_service', lang)}</h4>
              <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 py-2">
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="motorcycle" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="car_driver" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="car_self" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="vehicle_special" /></li>
              </ul>
            </div>
            {/* 4. DỊCH VỤ ĐỔI TIỀN TỆ */}
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
              >{t('currency_exchange', lang)}</h4>
              <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 py-2">
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="usd" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="eur" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="gbp" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="jpy" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="rub" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="currency_exchange" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="currency_other" /></li>
              </ul>
            </div>
            {/* 5. DỊCH VỤ GIẶT ỦI */}
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
              >{t('laundry_service', lang)}</h4>
              <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 py-2">
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="laundry_regular" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="laundry_special" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="laundry_express" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="laundry_additional" /></li>
              </ul>
            </div>
            {/* 6. DỊCH VỤ HOMESTAY */}
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
              >{t('homestay_service', lang)}</h4>
              <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 py-2">
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="homestay_300k" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="homestay_300_600k" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="homestay_600k" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="homestay_longterm" /></li>
                <li className="w-16 h-16 flex items-center justify-center"><IconWithTooltip iconName="homestay_additional" /></li>
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
                  
                  <p className="text-xs sm:text-sm mb-0.5 px-1.5"><strong>{t('order_ref', lang)}:</strong> {o.reference}</p>
                  <p className="text-xs sm:text-sm mb-0.5 px-1.5"><strong>{t('requested_at', lang)}:</strong> {o.requestedAt.toLocaleString('en-US', {timeZone: 'Asia/Ho_Chi_Minh', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="text-xs sm:text-sm mb-0.5 px-1.5"><strong>{t('estimated_completion', lang)}:</strong> {o.estimatedTime}</p>
                  
                  {/* Thêm trạng thái - hiển thị theo ngôn ngữ đã chọn */}
                  <div className="mt-2 flex justify-center">
                    {(() => {
                      const style = getStatusStyle(o.status);
                      // Log để debug
                      console.log('Order status:', o.status, '->', getStatusTranslationKey(o.status));
                      return (
                        <span className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold ${style.bg} ${style.text} w-full text-center shadow-md border border-white/60`}
                          style={{
                            borderRadius: '16px',
                            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.12)',
                            transition: 'all 0.2s ease',
                            letterSpacing: 0.2
                          }}
                        >
                          <span className="material-icons text-base mr-1" style={{marginTop: -2}}>{style.icon}</span>
                          {t(getStatusTranslationKey(o.status), lang)}
                        </span>
                      );
                    })()}
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

export default Interface1;
