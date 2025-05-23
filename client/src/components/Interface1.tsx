// Interface1 component - latest version v1.0.1 
import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '../assets/hotel-exterior.jpeg';
import { t, Lang } from '../i18n';
import { ActiveOrder } from '@/types';
import { initVapi, getVapiInstance } from '@/lib/vapiClient';
import { FaGlobeAsia } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import { DualReference } from './Reference';
import { referenceService, ReferenceItem } from '@/services/ReferenceService';
import { iconMediaMap, IconMedia } from '../assets/iconMediaMap';
import { FaMountain, FaCarSide, FaUmbrellaBeach, FaStar, FaBusAlt, FaRoute, FaMotorcycle, FaTaxi, FaMoneyBillWave, FaEuroSign, FaPoundSign, FaYenSign, FaRubleSign, FaExchangeAlt, FaBitcoin, FaTshirt, FaSoap, FaBolt, FaPlus, FaHome, FaBuilding, FaCalendarAlt, FaPlusSquare, FaDollarSign, FaWonSign, FaCity } from 'react-icons/fa';
import { ReferenceMedia, ReferenceSlider } from './Reference';
import { OrderStatus } from '@shared/schema';

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

  // Thêm state để kiểm soát hiển thị reference media
  const [showReference, setShowReference] = useState(false);

  // Tạo object ánh xạ iconName -> React component icon sát nghĩa nhất
  const iconComponents: Record<string, JSX.Element> = {
    // TOURISM & TOURS
    sand_dunes: <FaMountain size={32} color="#DAC17A" />, // Đồi cát (fallback)
    sightseeing: <FaCity size={32} color="#DAC17A" />, // City tour
    jeep_tour: <FaCarSide size={32} color="#DAC17A" />, // Jeep Tour
    stream_beach: <FaUmbrellaBeach size={32} color="#DAC17A" />, // Stream and Beach
    special_tour: <FaStar size={32} color="#DAC17A" />, // Special Tours
    // BUS TICKETS
    bus_hcm: <span className="icon-bus-label">HCM</span>,
    bus_dl: <span className="icon-bus-label">ĐL</span>,
    bus_nt: <span className="icon-bus-label">NT</span>,
    bus_dn: <span className="icon-bus-label">DN</span>,
    bus_ct: <span className="icon-bus-label">CT</span>,
    bus_mt: <span className="icon-bus-label">MT</span>,
    bus_vt: <span className="icon-bus-label">VT</span>,
    bus_other: <FaRoute size={32} color="#DAC17A" />,
    // VEHICLE RENTAL
    motorcycle: <FaMotorcycle size={32} color="#DAC17A" />,
    car_driver: <FaTaxi size={32} color="#DAC17A" />,
    car_self: <FaCarSide size={32} color="#DAC17A" />,
    vehicle_special: <FaCarSide size={32} color="#DAC17A" />,
    // CURRENCY EXCHANGE
    usd: <FaDollarSign size={32} color="#DAC17A" />,
    eur: <FaEuroSign size={32} color="#DAC17A" />,
    gbp: <FaPoundSign size={32} color="#DAC17A" />,
    sgd: <FaMoneyBillWave size={32} color="#DAC17A" />,
    jpy: <FaYenSign size={32} color="#DAC17A" />,
    krw: <FaWonSign size={32} color="#DAC17A" />,
    rub: <FaRubleSign size={32} color="#DAC17A" />,
    currency_other: <FaBitcoin size={32} color="#DAC17A" />,
    // LAUNDRY SERVICE
    laundry_regular: <FaTshirt size={32} color="#DAC17A" />,
    laundry_special: <FaSoap size={32} color="#DAC17A" />,
    laundry_express: <FaBolt size={32} color="#DAC17A" />,
    laundry_additional: <FaPlus size={32} color="#DAC17A" />,
    // HOMESTAY SERVICE
    homestay_300k: <FaHome size={32} color="#DAC17A" />,
    homestay_300_600k: <FaHome size={32} color="#DAC17A" />,
    homestay_600k: <FaBuilding size={32} color="#DAC17A" />,
    homestay_longterm: <FaCalendarAlt size={32} color="#DAC17A" />,
    homestay_additional: <FaPlusSquare size={32} color="#DAC17A" />,
  };

  // Thêm object ánh xạ iconName -> tên dịch vụ đúng chuẩn:
  const iconDisplayNames: Record<string, string> = {
    // TRAVEL TOURS
    sand_dunes: 'Sand Dunes',
    sightseeing: 'Sightseeing',
    jeep_tour: 'Jeep',
    stream_beach: 'Stream and Beach',
    special_tour: 'Special Tours',
    // BUS TICKETS
    bus_hcm: 'Mui Ne - Ho Chi Minh City Route',
    bus_dl: 'Mui Ne - Da Lat Route',
    bus_nt: 'Mui Ne - Nha Trang Route',
    bus_dn: 'Mui Ne - Da Nang Route',
    bus_ct: 'Mui Ne - Can Tho Route',
    bus_mt: 'Mui Ne - My Tho Route',
    bus_vt: 'Mui Ne - Vung Tau Route',
    bus_other: 'Other Routes',
    // VEHICLE RENTAL
    motorcycle: 'Motorcycle Rental',
    car_driver: 'Car Rental (with driver)',
    car_self: 'Car Rental (self-drive)',
    vehicle_special: 'Special Vehicle Rental',
    // CURRENCY EXCHANGE
    usd: 'USD',
    eur: 'EUR',
    gbp: 'GBP',
    sgd: 'SGD',
    jpy: 'JPY',
    krw: 'KRW',
    rub: 'RUB',
    currency_other: 'Additional Currency Services',
    // LAUNDRY SERVICE
    laundry_regular: 'Regular Laundry Service',
    laundry_special: 'Special Laundry Service',
    laundry_express: 'Express Laundry Service',
    laundry_additional: 'Additional Laundry Services',
    // HOMESTAY SERVICE
    homestay_300k: 'Price Range/day: <300k',
    homestay_300_600k: 'Price Range/day: 300k-600k',
    homestay_600k: 'Price Range/day: Above 600k',
    homestay_longterm: 'Long-term Rental',
    homestay_additional: 'Additional Homestay Services',
  };

  // Định nghĩa mảng iconName cho từng nhóm dịch vụ (theo danh sách mới)
  const travelTourIcons = [
    "tour_halfday", // Tour_Nửa_ngày
    "tour_fullday", // Tour_Một_ngày
    "tour_multiday", // Tour_Dài_ngày
    "special_tour"   // Tour_đặc_biệt
  ];
  const busTicketIcons = [
    "bus_hcm", "bus_dl", "bus_nt", "bus_dn", "bus_ct", "bus_mt", "bus_vt", "bus_other"
  ];
  const vehicleRentalIcons = [
    "motorcycle", "car_driver", "car_self"
  ];
  const currencyIcons = [
    "usd", "eur", "krw", "rub", "currency_other"
  ];
  const laundryIcons = [
    "laundry_regular", "laundry_special", "laundry_express", "laundry_additional"
  ];
  const homestayIcons = [
    "homestay_300k", "homestay_300_600k", "homestay_600k", "homestay_longterm", "homestay_fullhouse", "homestay_additional"
  ];

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

  // Khi nhấn icon, set activeIcon và showReference (nếu nhấn lại icon đang chọn thì bỏ chọn)
  const handleIconClick = (iconName: string) => {
    if (activeIcon === iconName && showReference) {
      setActiveIcon(null);
      setShowReference(false);
    } else {
      setActiveIcon(iconName);
      // Chỉ show reference nếu icon có media
      if (iconMediaMap[iconName] && (Array.isArray(iconMediaMap[iconName]) ? iconMediaMap[iconName].length > 0 : iconMediaMap[iconName].src)) {
        setShowReference(true);
      } else {
        setShowReference(false);
      }
    }
    // Tooltip logic giữ nguyên
    setActiveTooltip(activeTooltip === iconName ? null : iconName);
    if (activeTooltip !== iconName) {
      setTimeout(() => {
        setActiveTooltip(currentTooltip => currentTooltip === iconName ? null : currentTooltip);
      }, 3000);
    }
  };

  // Hàm truyền vào Reference để đóng media động
  const handleCloseMedia = () => {
    setActiveIcon(null);
    setShowReference(false);
  };

  // Lấy media động tương ứng nếu có (hỗ trợ nhiều media)
  const getActiveIconMediaList = () => {
    if (!activeIcon || !iconMediaMap[activeIcon]) return [];
    const media = iconMediaMap[activeIcon];
    if (Array.isArray(media)) return media;
    if (media && media.src) return [media];
    return [];
  };

  // Component hiển thị icon với tooltip
  const IconWithTooltip = ({ iconName, className, iconSize = 32 }: { iconName: string, className?: string, iconSize?: number }) => (
    <div className="relative flex flex-col items-center justify-center cursor-pointer">
      <span
        className={className || ''}
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
        onClick={() => handleIconClick(iconName)}
      >
        {React.cloneElement(iconComponents[iconName] || <span className="text-red-500">?</span>, { size: iconSize })}
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
    
    switch (status.toLowerCase()) {
      case OrderStatus.ACKNOWLEDGED:
        return 'status_acknowledged';
      case OrderStatus.IN_PROGRESS:
        return 'status_in_progress';
      case OrderStatus.DELIVERING:
        return 'status_delivering';
      case OrderStatus.COMPLETED:
        return 'status_completed';
      case OrderStatus.NOTE:
        return 'status_note';
      default:
        return 'status_acknowledged';
    }
  };

  // Log dữ liệu order thực tế để debug
  console.log('ActiveOrders:', activeOrders);

  // Thêm hook để xác định mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Sửa hàm renderIconGroup để nhận iconSize động
  const renderIconGroup = (icons: string[], col: number, iconSize = 22) => {
    const items = icons.map(icon => {
      return (
        <li key={icon} className="w-10 h-10 flex items-center justify-center">
          {iconComponents[icon] ? <IconWithTooltip iconName={icon} iconSize={iconSize} /> : <span className="text-red-500">?</span>}
        </li>
      );
    });
    // Bổ sung li invisible nếu thiếu để đủ hàng cuối
    const remainder = icons.length % col;
    if (remainder !== 0) {
      for (let i = 0; i < col - remainder; i++) {
        items.push(<li key={`invisible-${i}`} className="w-10 h-10 flex items-center justify-center invisible"></li>);
      }
    }
    return items;
  };

  return (
    <div 
      className={`absolute w-full min-h-screen h-full transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } z-10 overflow-y-auto`} 
      id="interface1"
      style={{
        backgroundImage: `linear-gradient(rgba(139,26,71,0.7), rgba(168,34,85,0.6)), url(${hotelImage})`,
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
            <FaGlobeAsia className="text-[#DAC17A] text-xl mr-1.5" 
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
              <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#DAC17A] pointer-events-none text-lg" />
            </div>
          </div>
        </div>
        <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-amber-400 mb-2 text-center"
          style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}>
          <span style={{ color: 'red', fontStyle: 'italic', marginRight: 8 }}>Demo</span>{t('hotel_name', lang)}
        </h2>
        <p className="text-xs sm:text-lg lg:text-xl text-center max-w-full mb-4 truncate sm:whitespace-nowrap overflow-x-auto">AI-powered Voice Assistant - Supporting All Your Needs</p>
        
        {/* Thay thế block layout media + nút gọi */}
        <div className="w-full mb-8 mt-2">
          {/* Mobile: ReferenceSlider trượt ngang toàn bộ media, chỉ hiển thị trên mobile, luôn căn giữa */}
          <div className="block md:hidden mb-4 flex flex-col items-center justify-center">
            {getActiveIconMediaList().length > 0 && (
              <div className="w-full flex justify-center">
                <ReferenceSlider mediaList={getActiveIconMediaList()} activeIdx={0} onChange={() => {}} side="mobile" />
              </div>
            )}
            {/* Nút gọi riêng cho mobile, luôn căn giữa dưới slider */}
            <div className="w-full flex justify-center items-center mt-4">
              <div className="relative flex items-center justify-center">
                {/* Ripple Animation (luôn hiển thị, mạnh hơn khi hover) */}
                <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-[ripple_1.5s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-80 opacity-60"></div>
                <div className="absolute inset-0 rounded-full border-4 border-amber-400/70 animate-[ripple_2s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-60 opacity-40"></div>
                {/* Main Button */}
                <button 
                  id={`vapiButton${lang === 'en' ? 'En' : lang === 'fr' ? 'Fr' : lang === 'zh' ? 'Zh' : lang === 'ru' ? 'Ru' : 'Ko'}`}
                  className="group relative w-36 h-36 sm:w-40 sm:h-40 rounded-full font-poppins font-bold flex flex-col items-center justify-center overflow-hidden hover:translate-y-[-2px] hover:shadow-[0px_12px_20px_rgba(0,0,0,0.2)]"
                  onClick={() => handleCall(lang as any)}
                  style={{
                    background: lang === 'en' 
                      ? 'linear-gradient(180deg, rgba(139,26,71,0.9) 0%, rgba(139,26,71,0.9) 100%)' // Tiếng Anh - Plum Red
                      : lang === 'fr' 
                      ? 'linear-gradient(180deg, rgba(139,26,71,0.9) 0%, rgba(139,26,71,0.9) 100%)' // Tiếng Pháp - Plum Red
                      : lang === 'zh' 
                      ? 'linear-gradient(180deg, rgba(139,26,71,0.9) 0%, rgba(139,26,71,0.9) 100%)' // Tiếng Trung - Plum Red
                      : lang === 'ru' 
                      ? 'linear-gradient(180deg, rgba(139,26,71,0.9) 0%, rgba(139,26,71,0.9) 100%)' // Tiếng Nga - Plum Red
                      : 'linear-gradient(180deg, rgba(139,26,71,0.9) 0%, rgba(139,26,71,0.9) 100%)', // Tiếng Hàn - Plum Red
                    boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25), 0px 6px 12px rgba(0, 0, 0, 0.15), inset 0px 1px 0px rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0) translateZ(30px)',
                  }}
                >
                  <span className="material-icons text-4xl sm:text-6xl mb-2 text-[#DAC17A] transition-all duration-300 group-hover:scale-110" 
                    style={{ 
                      filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))',
                      color: lang === 'en' 
                        ? '#DAC17A' // Vàng cho tiếng Anh
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
                    <span className="text-sm sm:text-lg font-bold text-white px-2 text-center"
                      style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
                    >{t('press_to_call', lang)}</span>
                  ) : lang === 'ru' || lang === 'ko' ? (
                    <span className="text-sm sm:text-lg font-bold text-white px-2 text-center"
                      style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
                    >{t('press_to_call', lang)}</span>
                  ) : (
                    <span className="text-lg sm:text-xl font-bold whitespace-nowrap text-white"
                      style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
                    >{t('press_to_call', lang)}</span>
                  )}
                  <span className="absolute w-full h-full rounded-full pointer-events-none"></span>
                </button>
              </div>
            </div>
          </div>
          {/* Desktop: 3 cột, nút gọi luôn giữa 2 reference, cùng hàng, căn giữa tuyệt đối */}
          <div className="hidden md:grid grid-cols-3 items-center justify-items-center gap-4">
            {/* ReferenceMedia bên trái */}
            <div className="flex items-center justify-center min-h-[240px]">
              {getActiveIconMediaList()[0] && <ReferenceMedia media={getActiveIconMediaList()[0]} />}
            </div>
            {/* Nút gọi luôn ở giữa */}
            <div className="flex items-center justify-center min-h-[240px]">
              <div className="relative flex items-center justify-center">
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
                      ? 'linear-gradient(180deg, rgba(139,26,71,0.9) 0%, rgba(139,26,71,0.9) 100%)' // Tiếng Anh - Plum Red
                      : lang === 'fr' 
                      ? 'linear-gradient(180deg, rgba(139,26,71,0.9) 0%, rgba(139,26,71,0.9) 100%)' // Tiếng Pháp - Plum Red
                      : lang === 'zh' 
                      ? 'linear-gradient(180deg, rgba(139,26,71,0.9) 0%, rgba(139,26,71,0.9) 100%)' // Tiếng Trung - Plum Red
                      : lang === 'ru' 
                      ? 'linear-gradient(180deg, rgba(139,26,71,0.9) 0%, rgba(139,26,71,0.9) 100%)' // Tiếng Nga - Plum Red
                      : 'linear-gradient(180deg, rgba(139,26,71,0.9) 0%, rgba(139,26,71,0.9) 100%)', // Tiếng Hàn - Plum Red
                    boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25), 0px 6px 12px rgba(0, 0, 0, 0.15), inset 0px 1px 0px rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0) translateZ(30px)',
                  }}
                >
                  <span className="material-icons text-4xl sm:text-6xl lg:text-7xl mb-2 text-[#DAC17A] transition-all duration-300 group-hover:scale-110" 
                    style={{ 
                      filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))',
                      color: lang === 'en' 
                        ? '#DAC17A' // Vàng cho tiếng Anh
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
            </div>
            {/* ReferenceMedia bên phải */}
            <div className="flex items-center justify-center min-h-[240px]">
              {getActiveIconMediaList()[1] && <ReferenceMedia media={getActiveIconMediaList()[1]} />}
            </div>
          </div>
        </div>
        {/* Services Section - với hiệu ứng Glass Morphism và 3D */}
        <div className="text-center w-full max-w-5xl mb-8 sm:mb-10" style={{ perspective: '1000px' }}>
          <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-y-1.5 sm:gap-y-2 md:gap-3 text-left mx-auto w-full">
            {/* 1. TRAVEL TOURS */}
            <div
              className="py-0.5 px-1 sm:p-2 w-11/12 sm:w-4/5 md:w-64 mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                borderRadius: '6px',
                boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <h4 className="font-medium text-amber-300 pb-0 mb-0 text-xs sm:text-sm"
                style={{
                  borderBottom: 'none',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                }}
              >{t('tourism_tour', lang)}</h4>
              <ul className={
                isMobile
                  ? "flex flex-row flex-nowrap justify-center items-center gap-x-2 py-0"
                  : "grid grid-cols-3 gap-x-1 gap-y-1 py-0.5 justify-items-center"
              }>
                {renderIconGroup(travelTourIcons, isMobile ? travelTourIcons.length : 3, isMobile ? 18 : 28)}
              </ul>
            </div>
            {/* 2. BUS TICKETS */}
            <div
              className="py-0.5 px-1 sm:p-2 w-11/12 sm:w-[95%] md:w-[480px] mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                borderRadius: '6px',
                boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <h4 className="font-medium text-amber-300 pb-0 mb-0 text-xs sm:text-sm"
                style={{
                  borderBottom: 'none',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                }}
              >{t('ticket_bus', lang)}</h4>
              <ul className={
                isMobile
                  ? "flex flex-row flex-wrap justify-center items-center gap-x-2 gap-y-2 py-0"
                  : "grid grid-cols-4 gap-x-1 gap-y-1 py-0.5 justify-items-center"
              }>
                {renderIconGroup(busTicketIcons, isMobile ? 4 : 4, isMobile ? 18 : 28)}
              </ul>
            </div>
            {/* 3. VEHICLE RENTAL */}
            <div
              className="py-0.5 px-1 sm:p-2 w-11/12 sm:w-4/5 md:w-64 mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                borderRadius: '6px',
                boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <h4 className="font-medium text-amber-300 pb-0 mb-0 text-xs sm:text-sm"
                style={{
                  borderBottom: 'none',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                }}
              >{t('rental_service', lang)}</h4>
              <ul className={
                isMobile
                  ? "flex flex-row flex-nowrap justify-center items-center gap-x-2 py-0"
                  : "grid grid-cols-2 gap-x-1 gap-y-1 py-0.5 justify-items-center"
              }>
                {renderIconGroup(vehicleRentalIcons, isMobile ? vehicleRentalIcons.length : 2, isMobile ? 18 : 28)}
              </ul>
            </div>
            {/* 4. CURRENCY EXCHANGE */}
            <div
              className="py-0.5 px-1 sm:p-2 w-11/12 sm:w-4/5 md:w-64 mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                borderRadius: '6px',
                boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <h4 className="font-medium text-amber-300 pb-0 mb-0 text-xs sm:text-sm"
                style={{
                  borderBottom: 'none',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                }}
              >{t('currency_exchange', lang)}</h4>
              <ul className={
                isMobile
                  ? "flex flex-row flex-nowrap justify-center items-center gap-x-2 py-0"
                  : "grid grid-cols-4 gap-x-1 gap-y-1 py-0.5 justify-items-center"
              }>
                {renderIconGroup(currencyIcons, isMobile ? currencyIcons.length : 4, isMobile ? 16 : 26)}
              </ul>
            </div>
            {/* 5. LAUNDRY SERVICE */}
            <div
              className="py-0.5 px-1 sm:p-2 w-11/12 sm:w-4/5 md:w-64 mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                borderRadius: '6px',
                boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <h4 className="font-medium text-amber-300 pb-0 mb-0 text-xs sm:text-sm"
                style={{
                  borderBottom: 'none',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                }}
              >{t('laundry_service', lang)}</h4>
              <ul className={
                isMobile
                  ? "flex flex-row flex-nowrap justify-center items-center gap-x-2 py-0"
                  : "grid grid-cols-3 gap-x-1 gap-y-1 py-0.5 justify-items-center"
              }>
                {renderIconGroup(laundryIcons, isMobile ? laundryIcons.length : 3, isMobile ? 18 : 28)}
              </ul>
            </div>
            {/* 6. HOMESTAY SERVICE */}
            <div
              className="py-0.5 px-1 sm:p-2 w-11/12 sm:w-4/5 md:w-64 mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                borderRadius: '6px',
                boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <h4 className="font-medium text-amber-300 pb-0 mb-0 text-xs sm:text-sm"
                style={{
                  borderBottom: 'none',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                }}
              >{t('homestay_service', lang)}</h4>
              <ul className={
                isMobile
                  ? "flex flex-row flex-nowrap justify-center items-center gap-x-2 py-0"
                  : "grid grid-cols-3 gap-x-1 gap-y-1 py-0.5 justify-items-center"
              }>
                {renderIconGroup(homestayIcons, isMobile ? homestayIcons.length : 3, isMobile ? 18 : 28)}
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
                  className="p-2 sm:p-3 text-gray-800 max-w-xs w-[260px] flex-shrink-0 transition-all duration-250 hover:rotate-1 hover:scale-105"
                  style={{
                    background: 'rgba(139,26,71,0.85)',
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
                  {/* Thông tin đơn hàng */}
                  <div className="space-y-1 text-sm text-white/90">
                    <div><b>{t('order_reference', lang)}:</b> <span className="font-mono">{o.reference}</span></div>
                    {o.status && <div><b>{t('status', lang)}:</b> {t(getStatusTranslationKey(o.status), lang)}</div>}
                    <div><b>{t('created_at', lang)}:</b> {o.requestedAt.toLocaleString()}</div>
                    {o.estimatedTime && <div><b>{t('estimated_delivery_time', lang)}:</b> {o.estimatedTime}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Nút xóa lịch sử order */}
        <div className="w-full flex justify-end mb-2">
          <button
            onClick={async () => {
              try {
                await fetch('/api/orders/all', { method: 'DELETE' });
              } catch {}
              localStorage.removeItem('activeOrders');
              window.location.reload();
            }}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded shadow text-xs sm:text-sm"
          >
            Xóa lịch sử order
          </button>
        </div>
        {showReference && getActiveIconMediaList().length > 0 && (
          <div className="w-full flex flex-col items-center justify-center gap-4 my-4">
            {/* Nếu có nhiều hơn 2 media, hiển thị slider, ngược lại hiển thị 1 hoặc 2 khung */}
            {getActiveIconMediaList().length > 2 ? (
              <ReferenceSlider
                mediaList={getActiveIconMediaList()}
                activeIdx={0}
                onChange={() => {}}
                side="mobile"
              />
            ) : (
              <div className="flex flex-row items-center justify-center gap-4 w-full">
                {getActiveIconMediaList().map((media, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <ReferenceMedia media={media} />
                    {/* Hiển thị mô tả nếu có */}
                    {media.description && (
                      <div className="mt-2 text-sm text-yellow-100 text-center max-w-xs px-2 opacity-90">{media.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Interface1;