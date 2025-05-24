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
import { Bus, Mountain, Landmark, Car, CarFront, Bike, Coins, Euro, DollarSign, Shirt, Sparkles, Home, Building2, CalendarDays, KeyRound, UserRound, Plus, Star, Sun, CalendarCheck, Umbrella, Map, Ship, Waves, ArrowRightLeft } from 'lucide-react';

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

  // Thêm state để quản lý menu đang chọn trên mobile
  const [activeMenu, setActiveMenu] = useState<string>('tours');

  // State để điều khiển popup infographic
  const [showInfographic, setShowInfographic] = useState(false);

  // Thêm state loading, error cho orders
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Theo dõi thay đổi activeOrders để xác định trạng thái loading/error
  useEffect(() => {
    setOrdersLoading(false);
    setOrdersError(null);
    // Nếu activeOrders là undefined hoặc null, coi như đang loading
    if (typeof activeOrders === 'undefined' || activeOrders === null) {
      setOrdersLoading(true);
    } else if (Array.isArray(activeOrders) && activeOrders.length === 0) {
      setOrdersError('Không có đơn hàng nào đang hoạt động.');
    }
  }, [activeOrders]);

  const iconColor = '#FFC94A'; // Màu vàng giống tiêu đề
  const iconComponents: Record<string, JSX.Element> = {
    // TOURISM & TOURS
    tour_halfday: <Sun color={iconColor} size={28} strokeWidth={2} />, // Half Day
    tour_fullday: <CalendarDays color={iconColor} size={28} strokeWidth={2} />, // Full Day
    tour_multiday: <CalendarCheck color={iconColor} size={28} strokeWidth={2} />, // Multi Day
    special_tour: <Star color={iconColor} size={28} strokeWidth={2} />, // Special
    // BUS TICKETS
    bus_hcm: <Bus color={iconColor} size={28} strokeWidth={2} />, // HCM
    bus_dl: <Mountain color={iconColor} size={28} strokeWidth={2} />, // Dalat
    bus_nt: <Umbrella color={iconColor} size={28} strokeWidth={2} />, // Nha Trang
    bus_dn: <Landmark color={iconColor} size={28} strokeWidth={2} />, // Da Nang
    bus_ct: <Ship color={iconColor} size={28} strokeWidth={2} />, // Can Tho
    bus_mt: <Waves color={iconColor} size={28} strokeWidth={2} />, // My Tho
    bus_vt: <Map color={iconColor} size={28} strokeWidth={2} />, // Vung Tau
    bus_other: <ArrowRightLeft color={iconColor} size={28} strokeWidth={2} />, // Other
    // VEHICLE RENTAL
    motorcycle: <Bike color={iconColor} size={28} strokeWidth={2} />, // Motorbike
    car_driver: <CarFront color={iconColor} size={28} strokeWidth={2} />, // Car with driver
    car_self: <Car color={iconColor} size={28} strokeWidth={2} />, // Self-drive car
    // CURRENCY EXCHANGE
    usd: <DollarSign color={iconColor} size={28} strokeWidth={2} />, // USD
    eur: <Euro color={iconColor} size={28} strokeWidth={2} />, // EUR
    krw: <Coins color={iconColor} size={28} strokeWidth={2} />, // KRW (Coins)
    rub: <Coins color={iconColor} size={28} strokeWidth={2} />, // RUB (Coins)
    currency_other: <Coins color={iconColor} size={28} strokeWidth={2} />, // Other
    // LAUNDRY SERVICE
    laundry_regular: <Shirt color={iconColor} size={28} strokeWidth={2} />, // Regular
    laundry_special: <Sparkles color={iconColor} size={28} strokeWidth={2} />, // Special
    laundry_express: <Plus color={iconColor} size={28} strokeWidth={2} />, // Express
    laundry_additional: <Plus color={iconColor} size={28} strokeWidth={2} />, // Additional
    // HOMESTAY SERVICE
    homestay_300k: <Home color={iconColor} size={28} strokeWidth={2} />, // <300k
    homestay_300_600k: <Building2 color={iconColor} size={28} strokeWidth={2} />, // 300-600k
    homestay_600k: <Building2 color={iconColor} size={28} strokeWidth={2} />, // >600k
    homestay_longterm: <CalendarDays color={iconColor} size={28} strokeWidth={2} />, // Long-term
    homestay_fullhouse: <KeyRound color={iconColor} size={28} strokeWidth={2} />, // Full house
    homestay_additional: <UserRound color={iconColor} size={28} strokeWidth={2} />, // Additional
  };

  // Object ánh xạ tên icon cho từng ngôn ngữ
  const iconDisplayNamesEn: Record<string, string> = {
    tour_halfday: 'Half Day',
    tour_fullday: 'Full Day',
    tour_multiday: '2 Days & More',
    special_tour: 'Special Tours',
    bus_hcm: 'HCM',
    bus_dl: 'Dalat',
    bus_nt: 'Nha Trang',
    bus_dn: 'Da Nang',
    bus_ct: 'Can Tho',
    bus_mt: 'My Tho',
    bus_vt: 'Vung Tau',
    bus_other: 'Other Routes',
    motorcycle: 'Motorbike',
    car_driver: 'Car with Driver',
    car_self: 'Self-drive Car',
    usd: 'US Dollar',
    eur: 'Euro',
    krw: 'Korean Won',
    rub: 'Russian Ruble',
    currency_other: 'Other',
    laundry_regular: 'Regular Laundry',
    laundry_special: 'Special Laundry',
    laundry_express: 'Express Laundry',
    laundry_additional: 'Additional Laundry',
    homestay_300k: '< 300k',
    homestay_300_600k: '300-600k',
    homestay_600k: 'over 600k',
    homestay_longterm: 'Long-term',
    homestay_fullhouse: 'Full House',
    homestay_additional: 'Additional Services',
  };
  const iconDisplayNamesFr: Record<string, string> = {
    tour_halfday: 'Demi-journée',
    tour_fullday: 'Journée complète',
    tour_multiday: '2 jours et plus',
    special_tour: 'Tours spéciaux',
    bus_hcm: 'HCM',
    bus_dl: 'Dalat',
    bus_nt: 'Nha Trang',
    bus_dn: 'Da Nang',
    bus_ct: 'Can Tho',
    bus_mt: 'My Tho',
    bus_vt: 'Vung Tau',
    bus_other: 'Autres lignes',
    motorcycle: 'Moto',
    car_driver: 'Voiture avec chauffeur',
    car_self: 'Voiture sans chauffeur',
    usd: 'Dollar US',
    eur: 'Euro',
    krw: 'Won coréen',
    rub: 'Rouble russe',
    currency_other: 'Autre',
    laundry_regular: 'Blanchisserie standard',
    laundry_special: 'Blanchisserie spéciale',
    laundry_express: 'Blanchisserie express',
    laundry_additional: 'Blanchisserie supplémentaire',
    homestay_300k: '< 300k',
    homestay_300_600k: '300-600k',
    homestay_600k: '> 600k',
    homestay_longterm: 'Longue durée',
    homestay_fullhouse: 'Maison entière',
    homestay_additional: 'Services supplémentaires',
  };
  const iconDisplayNamesRu: Record<string, string> = {
    tour_halfday: 'Полдня',
    tour_fullday: 'Целый день',
    tour_multiday: '2 дня и более',
    special_tour: 'Особые туры',
    bus_hcm: 'Хошимин',
    bus_dl: 'Далат',
    bus_nt: 'Нячанг',
    bus_dn: 'Дананг',
    bus_ct: 'Кан Тхо',
    bus_mt: 'Ми Тхо',
    bus_vt: 'Вунгтау',
    bus_other: 'Другие маршруты',
    motorcycle: 'Мотоцикл',
    car_driver: 'Авто с водителем',
    car_self: 'Авто без водителя',
    usd: 'Доллар США',
    eur: 'Евро',
    krw: 'Корейская вона',
    rub: 'Российский рубль',
    currency_other: 'Другое',
    laundry_regular: 'Стандартная стирка',
    laundry_special: 'Специальная стирка',
    laundry_express: 'Экспресс-стирка',
    laundry_additional: 'Доп. стирка',
    homestay_300k: '< 300k',
    homestay_300_600k: '300-600k',
    homestay_600k: '> 600k',
    homestay_longterm: 'Долгосрочно',
    homestay_fullhouse: 'Весь дом',
    homestay_additional: 'Доп. услуги',
  };
  const iconDisplayNamesZh: Record<string, string> = {
    tour_halfday: '半天',
    tour_fullday: '全天',
    tour_multiday: '2天及以上',
    special_tour: '特色旅游',
    bus_hcm: '胡志明',
    bus_dl: '大叻',
    bus_nt: '芽庄',
    bus_dn: '岘港',
    bus_ct: '芹苴',
    bus_mt: '美拖',
    bus_vt: '头顿',
    bus_other: '其他线路',
    motorcycle: '摩托车',
    car_driver: '带司机汽车',
    car_self: '自驾汽车',
    usd: '美元',
    eur: '欧元',
    krw: '韩元',
    rub: '卢布',
    currency_other: '其他',
    laundry_regular: '普通洗衣',
    laundry_special: '特殊洗衣',
    laundry_express: '快速洗衣',
    laundry_additional: '附加洗衣',
    homestay_300k: '< 300k',
    homestay_300_600k: '300-600k',
    homestay_600k: '> 600k',
    homestay_longterm: '长期',
    homestay_fullhouse: '整栋',
    homestay_additional: '附加服务',
  };
  const iconDisplayNamesKo: Record<string, string> = {
    tour_halfday: '반나절',
    tour_fullday: '하루',
    tour_multiday: '2일 이상',
    special_tour: '특별 투어',
    bus_hcm: '호치민',
    bus_dl: '달랏',
    bus_nt: '나트랑',
    bus_dn: '다낭',
    bus_ct: '껀터',
    bus_mt: '미토',
    bus_vt: '붕따우',
    bus_other: '기타 노선',
    motorcycle: '오토바이',
    car_driver: '운전기사 포함 차량',
    car_self: '자가 운전 차량',
    usd: '미국 달러',
    eur: '유로',
    krw: '한국 원',
    rub: '러시아 루블',
    currency_other: '기타',
    laundry_regular: '일반 세탁',
    laundry_special: '특수 세탁',
    laundry_express: '급속 세탁',
    laundry_additional: '추가 세탁',
    homestay_300k: '< 300k',
    homestay_300_600k: '300-600k',
    homestay_600k: '> 600k',
    homestay_longterm: '장기',
    homestay_fullhouse: '전체 집',
    homestay_additional: '추가 서비스',
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
  const IconWithTooltip = ({ iconName, className, iconSize = 32, position = 'center' }: { iconName: string, className?: string, iconSize?: number, position?: 'left' | 'center' | 'right' }) => {
    let tooltipText = iconDisplayNamesEn[iconName] || iconName;
    if (lang === 'fr') tooltipText = iconDisplayNamesFr[iconName] || tooltipText;
    else if (lang === 'ru') tooltipText = iconDisplayNamesRu[iconName] || tooltipText;
    else if (lang === 'zh') tooltipText = iconDisplayNamesZh[iconName] || tooltipText;
    else if (lang === 'ko') tooltipText = iconDisplayNamesKo[iconName] || tooltipText;
    return (
    <div className="relative flex flex-col items-center justify-center cursor-pointer">
      <span 
          className={className || ''}
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
        onClick={() => handleIconClick(iconName)}
      >
          {React.cloneElement(iconComponents[iconName] || <span className="text-red-500">?</span>, { size: iconSize })}
      </span>
      {activeTooltip === iconName && (
          isMobile ? (
            <div className={`absolute top-full ${position === 'left' ? 'left-0' : position === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'} mt-2 w-max max-w-[90vw] bg-white/90 text-gray-800 text-xs sm:text-sm font-medium py-1 px-2 rounded shadow-lg z-50 pointer-events-none text-center break-words`}> 
              {tooltipText}
              <div className={`absolute w-2 h-2 bg-white/90 transform rotate-45 ${position === 'left' ? 'left-4' : position === 'right' ? 'right-4' : 'left-1/2 -translate-x-1/2'} -top-1`}></div>
            </div>
          ) : (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[180px] bg-white/90 text-gray-800 text-xs sm:text-sm font-medium py-1 px-2 rounded shadow-lg z-50 pointer-events-none text-center">
              {tooltipText}
          <div className="absolute w-2 h-2 bg-white/90 transform rotate-45 left-1/2 -translate-x-1/2 top-full -mt-1"></div>
        </div>
          )
      )}
    </div>
  );
  };

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

  // 1. Tạo component LanguageSelector để tái sử dụng ở header
  const LanguageSelector = () => (
    <div className="flex items-center justify-center w-full max-w-2xl mb-4 sm:mb-2">
      {/* Icon infographic bên trái Language trên mobile */}
      <button
        onClick={() => setShowInfographic(true)}
        className="flex items-center justify-center mr-2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 sm:hidden"
        title="Guidance"
      >
        <span className="material-icons text-2xl text-amber-400">info</span>
      </button>
      {/* Nút Refresh chỉ hiện trên sm trở lên */}
      <button
        onClick={() => window.location.reload()}
        className="hidden sm:flex items-center justify-center mr-3 px-2 py-1.5 sm:py-1.5 bg-white/80 hover:bg-yellow-100 border border-amber-400 rounded-full shadow transition-all duration-200 text-blue-900 font-bold text-sm sm:text-lg"
        style={{ minWidth: 32, minHeight: 32 }}
        title="Refresh"
      >
        <span className="material-icons text-lg sm:text-2xl mr-1 text-amber-400">refresh</span>
        <span className="hidden sm:inline font-semibold">Refresh</span>
      </button>
      <div className="flex items-center px-2 py-1.5 sm:py-1.5 gap-2 transition-all duration-300 mx-auto sm:mx-0" 
        style={{
          background: 'linear-gradient(135deg, #4e5ab7 0%, #3f51b5 100%)',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)', 
          borderRadius: '8px',
          minWidth: '90px',
          maxWidth: '60%',
          width: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
        <FaGlobeAsia className="text-[#DAC17A] text-lg mr-1.5 hidden sm:inline" 
          style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
        />
        <label className="mr-2 font-semibold font-sans text-white whitespace-nowrap text-xs sm:text-base hidden sm:inline">{t('language', lang)}:</label>
        <div className="relative flex-1">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as 'en' | 'fr' | 'zh' | 'ru' | 'ko')}
            className="appearance-none w-full pl-4 sm:pl-8 pr-4 py-1 sm:py-1.5 font-sans bg-transparent focus:outline-none transition-all duration-200 text-xs sm:text-base"
            style={{ fontWeight: 600, color: '#fff', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}
          >
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="ko">🇰🇷 한국어</option>
          </select>
          <FiChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-[#DAC17A] pointer-events-none text-base" />
        </div>
      </div>
    </div>
  );

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
        <div className="flex items-center justify-center w-full max-w-2xl mb-4 sm:mb-2">
          {/* Icon infographic bên trái Language trên mobile */}
          <button
            onClick={() => setShowInfographic(true)}
            className="flex items-center justify-center mr-2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 sm:hidden"
            title="Guidance"
          >
            <span className="material-icons text-2xl text-amber-400">info</span>
          </button>
          {/* Nút Refresh chỉ hiện trên sm trở lên */}
          <button
            onClick={() => window.location.reload()}
            className="hidden sm:flex items-center justify-center mr-3 px-2 py-1.5 sm:py-1.5 bg-white/80 hover:bg-yellow-100 border border-amber-400 rounded-full shadow transition-all duration-200 text-blue-900 font-bold text-sm sm:text-lg"
            style={{ minWidth: 32, minHeight: 32 }}
            title="Refresh"
          >
            <span className="material-icons text-lg sm:text-2xl mr-1 text-amber-400">refresh</span>
            <span className="hidden sm:inline font-semibold">Refresh</span>
          </button>
          <div className="flex items-center px-2 py-1.5 sm:py-1.5 gap-2 transition-all duration-300 mx-auto sm:mx-0" 
            style={{
              background: 'linear-gradient(135deg, #4e5ab7 0%, #3f51b5 100%)',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)', 
              borderRadius: '8px',
              minWidth: '90px',
              maxWidth: '60%',
              width: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
            <FaGlobeAsia className="text-[#DAC17A] text-lg mr-1.5 hidden sm:inline" 
              style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
            />
            <label className="mr-2 font-semibold font-sans text-white whitespace-nowrap text-xs sm:text-base hidden sm:inline">{t('language', lang)}:</label>
            <div className="relative flex-1">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as 'en' | 'fr' | 'zh' | 'ru' | 'ko')}
                className="appearance-none w-full pl-4 sm:pl-8 pr-4 py-1 sm:py-1.5 font-sans bg-transparent focus:outline-none transition-all duration-200 text-xs sm:text-base"
                style={{ fontWeight: 600, color: '#fff', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}
              >
                <option value="en">🇬🇧 English</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="ko">🇰🇷 한국어</option>
              </select>
              <FiChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-[#DAC17A] pointer-events-none text-base" />
            </div>
          </div>
        </div>
        {/* Popup infographic guidance cho mobile */}
        {isMobile && showInfographic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg shadow-lg p-5 max-w-xs w-full relative animate-fadeIn">
              <button
                onClick={() => setShowInfographic(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                title="Close"
              >
                <span className="material-icons text-xl">close</span>
              </button>
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="material-icons text-amber-400 text-3xl">call</span>
                  <div className="text-base font-bold text-gray-800">{t('press_to_order', lang)}</div>
                  <div className="text-xs text-gray-600 text-center">{t('press_to_call_desc', lang)}</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="material-icons text-amber-400 text-3xl">check_circle</span>
                  <div className="text-base font-bold text-gray-800">{t('confirm_request', lang)}</div>
                  <div className="text-xs text-gray-600 text-center">{t('confirm_request_desc', lang)}</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="material-icons text-amber-400 text-3xl">mail</span>
                  <div className="text-base font-bold text-gray-800">{t('send_to_reception', lang)}</div>
                  <div className="text-xs text-gray-600 text-center">{t('send_to_reception_desc', lang)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Thanh menu box cho mobile - scroll ngang native */}
        <div className="block sm:hidden w-full max-w-2xl mx-auto mb-2">
          <div className="flex flex-row flex-nowrap overflow-x-auto whitespace-nowrap gap-1 bg-white/10 rounded-lg p-1 shadow no-scrollbar">
            <button onClick={() => setActiveMenu('tours')} className={`flex-shrink-0 px-3 py-2 rounded font-bold text-sm ${activeMenu==='tours' ? 'bg-amber-400 text-pink-900' : 'bg-transparent text-amber-300'}`}>Tours</button>
            <button onClick={() => setActiveMenu('bus')} className={`flex-shrink-0 px-3 py-2 rounded font-bold text-sm ${activeMenu==='bus' ? 'bg-amber-400 text-pink-900' : 'bg-transparent text-amber-300'}`}>Bus Tickets</button>
            <button onClick={() => setActiveMenu('vehicle')} className={`flex-shrink-0 px-3 py-2 rounded font-bold text-sm ${activeMenu==='vehicle' ? 'bg-amber-400 text-pink-900' : 'bg-transparent text-amber-300'}`}>Vehicle Rental</button>
            <button onClick={() => setActiveMenu('currency')} className={`flex-shrink-0 px-3 py-2 rounded font-bold text-sm ${activeMenu==='currency' ? 'bg-amber-400 text-pink-900' : 'bg-transparent text-amber-300'}`}>Currency Exchange</button>
            <button onClick={() => setActiveMenu('laundry')} className={`flex-shrink-0 px-3 py-2 rounded font-bold text-sm ${activeMenu==='laundry' ? 'bg-amber-400 text-pink-900' : 'bg-transparent text-amber-300'}`}>Laundry Service</button>
            <button onClick={() => setActiveMenu('homestay')} className={`flex-shrink-0 px-3 py-2 rounded font-bold text-sm ${activeMenu==='homestay' ? 'bg-amber-400 text-pink-900' : 'bg-transparent text-amber-300'}`}>Homestay</button>
          </div>
        </div>
        {/* Tiêu đề lớn và mô tả: ẩn trên mobile, hiện trên sm trở lên */}
        <h2 className="hidden sm:block font-poppins font-bold text-base sm:text-3xl lg:text-4xl text-amber-400 mb-2 text-center"
          style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}>
          <span style={{ color: 'red', fontStyle: 'italic', marginRight: 8 }}>Demo</span>{t('hotel_name', lang)}
        </h2>
        <p className="hidden sm:block text-xs sm:text-lg lg:text-xl text-center max-w-full mb-4 truncate sm:whitespace-nowrap overflow-x-auto">AI-powered Voice Assistant - Supporting All Your Needs</p>
        {/* Hiển thị icon group theo menu đang chọn trên mobile - scroll ngang native */}
        {isMobile && (
          <div className="w-full flex justify-center mb-8">
            {activeMenu === 'tours' && (
              <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar"><ul className="flex flex-row flex-nowrap justify-start items-center gap-x-[0.85rem] py-0">{renderIconGroup(travelTourIcons, travelTourIcons.length, 18)}</ul></div>
            )}
            {activeMenu === 'bus' && (
              <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar"><ul className="flex flex-row flex-nowrap justify-start items-center gap-x-[0.85rem] py-0">{renderIconGroup(busTicketIcons, busTicketIcons.length, 18)}</ul></div>
            )}
            {activeMenu === 'vehicle' && (
              <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar"><ul className="flex flex-row flex-nowrap justify-start items-center gap-x-[0.85rem] py-0">{renderIconGroup(vehicleRentalIcons, vehicleRentalIcons.length, 18)}</ul></div>
            )}
            {activeMenu === 'currency' && (
              <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar"><ul className="flex flex-row flex-nowrap justify-start items-center gap-x-[0.85rem] py-0">{renderIconGroup(currencyIcons, currencyIcons.length, 18)}</ul></div>
            )}
            {activeMenu === 'laundry' && (
              <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar"><ul className="flex flex-row flex-nowrap justify-start items-center gap-x-[0.85rem] py-0">{renderIconGroup(laundryIcons, laundryIcons.length, 18)}</ul></div>
            )}
            {activeMenu === 'homestay' && (
              <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar"><ul className="flex flex-row flex-nowrap justify-start items-center gap-x-[0.85rem] py-0">{renderIconGroup(homestayIcons, homestayIcons.length, 18)}</ul></div>
            )}
          </div>
        )}
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
                  className="group relative w-[187px] h-[187px] sm:w-40 sm:h-40 rounded-full font-poppins font-bold flex flex-col items-center justify-center overflow-hidden hover:translate-y-[-2px] hover:shadow-[0px_12px_20px_rgba(0,0,0,0.2)]"
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
                    >{t('press_to_order', lang)}</span>
                  ) : lang === 'ru' || lang === 'ko' ? (
                    <span className="text-sm sm:text-lg font-bold text-white px-2 text-center"
                      style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
                    >{t('press_to_order', lang)}</span>
                  ) : (
                    <span className="text-lg sm:text-xl font-bold whitespace-nowrap text-white"
                      style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
                    >{t('press_to_order', lang)}</span>
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
            className="group relative w-[187px] h-[187px] sm:w-40 sm:h-40 lg:w-56 lg:h-56 rounded-full font-poppins font-bold flex flex-col items-center justify-center overflow-hidden hover:translate-y-[-2px] hover:shadow-[0px_12px_20px_rgba(0,0,0,0.2)]"
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
                    >{t('press_to_order', lang)}</span>
                  ) : lang === 'ru' || lang === 'ko' ? (
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-white px-2 text-center"
                style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
                    >{t('press_to_order', lang)}</span>
            ) : (
              <span className="text-lg sm:text-2xl lg:text-3xl font-bold whitespace-nowrap text-white"
                style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
                    >{t('press_to_order', lang)}</span>
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
        {!isMobile && (
          <div className="text-center w-full max-w-5xl mb-8 sm:mb-10" style={{ perspective: '1000px' }}>
            <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-y-1.5 sm:gap-y-2 md:gap-3 text-left mx-auto w-full">
              {/* 1. TRAVEL TOURS */}
              <div
                className="py-0.5 px-1 sm:p-2 w-[90%] sm:w-4/5 md:w-64 mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                  background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <h4 className="card-title font-medium text-amber-300 pb-0 mb-0 text-[0.46rem] sm:text-sm"
                  style={{
                    borderBottom: 'none',
                    textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                  }}
                >{t('tourism_tour', lang)}</h4>
                <ul className={
                  isMobile
                    ? "flex flex-row flex-nowrap justify-center items-center gap-x-[0.85rem] py-0"
                    : "grid grid-cols-3 gap-x-1 gap-y-1 py-0.5 justify-items-center"
                }>
                  {renderIconGroup(travelTourIcons, isMobile ? travelTourIcons.length : 3, isMobile ? 14 : 28)}
                </ul>
              </div>
              {/* 2. BUS TICKETS */}
              <div
                className="py-0.5 px-1 sm:p-2 w-[90%] sm:w-[95%] md:w-[480px] mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
                style={{ 
                  background: 'rgba(139,26,71,0.4)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <h4 className="card-title font-medium text-amber-300 pb-0 mb-0 text-[0.46rem] sm:text-sm"
                  style={{ 
                    borderBottom: 'none',
                    textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                  }}
                >{t('ticket_bus', lang)}</h4>
                <ul className={
                  isMobile
                    ? "flex flex-row flex-wrap justify-center items-center gap-x-[0.85rem] gap-y-2 py-0"
                    : "grid grid-cols-4 gap-x-1 gap-y-1 py-0.5 justify-items-center"
                }>
                  {renderIconGroup(busTicketIcons, isMobile ? 4 : 4, isMobile ? 14 : 28)}
              </ul>
            </div>
              {/* 3. VEHICLE RENTAL */}
              <div
                className="py-0.5 px-1 sm:p-2 w-[90%] sm:w-4/5 md:w-64 mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                  background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <h4 className="card-title font-medium text-amber-300 pb-0 mb-0 text-[0.46rem] sm:text-sm"
                style={{ 
                    borderBottom: 'none',
                    textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                  }}
                >{t('rental_service', lang)}</h4>
                <ul className={
                  isMobile
                    ? "flex flex-row flex-nowrap justify-center items-center gap-x-[0.85rem] py-0"
                    : "grid grid-cols-2 gap-x-1 gap-y-1 py-0.5 justify-items-center"
                }>
                  {renderIconGroup(vehicleRentalIcons, isMobile ? vehicleRentalIcons.length : 2, isMobile ? 14 : 28)}
              </ul>
            </div>
              {/* 4. CURRENCY EXCHANGE */}
              <div
                className="py-0.5 px-1 sm:p-2 w-[90%] sm:w-4/5 md:w-64 mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                  background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <h4 className="card-title font-medium text-amber-300 pb-0 mb-0 text-[0.46rem] sm:text-sm"
                style={{ 
                    borderBottom: 'none',
                    textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                  }}
                >{t('currency_exchange', lang)}</h4>
                <ul className={
                  isMobile
                    ? "flex flex-row flex-nowrap justify-center items-center gap-x-[0.85rem] py-0"
                    : "grid grid-cols-4 gap-x-1 gap-y-1 py-0.5 justify-items-center"
                }>
                  {renderIconGroup(currencyIcons, isMobile ? currencyIcons.length : 4, isMobile ? 14 : 26)}
              </ul>
            </div>
              {/* 5. LAUNDRY SERVICE */}
              <div
                className="py-0.5 px-1 sm:p-2 w-[90%] sm:w-4/5 md:w-64 mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                  background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <h4 className="card-title font-medium text-amber-300 pb-0 mb-0 text-[0.46rem] sm:text-sm"
                style={{ 
                    borderBottom: 'none',
                    textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                  }}
                >{t('laundry_service', lang)}</h4>
                <ul className={
                  isMobile
                    ? "flex flex-row flex-nowrap justify-center items-center gap-x-[0.85rem] py-0"
                    : "grid grid-cols-3 gap-x-1 gap-y-1 py-0.5 justify-items-center"
                }>
                  {renderIconGroup(laundryIcons, isMobile ? laundryIcons.length : 3, isMobile ? 14 : 28)}
              </ul>
            </div>
              {/* 6. HOMESTAY SERVICE */}
              <div
                className="py-0.5 px-1 sm:p-2 w-[90%] sm:w-4/5 md:w-64 mx-auto mb-0.5 sm:mb-2 rounded shadow-sm bg-opacity-80"
              style={{
                  background: 'rgba(139,26,71,0.4)',
                backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <h4 className="card-title font-medium text-amber-300 pb-0 mb-0 text-[0.46rem] sm:text-sm"
                style={{ 
                    borderBottom: 'none',
                    textShadow: '0px 1px 2px rgba(0,0,0,0.08)'
                  }}
                >{t('homestay_service', lang)}</h4>
                <ul className={
                  isMobile
                    ? "flex flex-row flex-nowrap justify-center items-center gap-x-[0.85rem] py-0"
                    : "grid grid-cols-3 gap-x-1 gap-y-1 py-0.5 justify-items-center"
                }>
                  {renderIconGroup(homestayIcons, isMobile ? homestayIcons.length : 3, isMobile ? 14 : 28)}
              </ul>
            </div>
          </div>
        </div>
        )}
        {/* Orders Section */}
        <div className="orders-section bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('activeOrders', lang)}</h2>
          
          {ordersLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">{t('loading', lang)}</span>
            </div>
          )}

          {ordersError && (
            <div className="text-center py-6">
              <div className="text-red-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-700">{ordersError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {t('retry', lang)}
              </button>
                  </div>
          )}

          {!ordersLoading && !ordersError && (!activeOrders || activeOrders.length === 0) && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-600">{t('noActiveOrders', lang)}</p>
            </div>
          )}

          {!ordersLoading && !ordersError && activeOrders && activeOrders.length > 0 && (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{order.serviceName}</h3>
                      <p className="text-sm text-gray-600">{order.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}>
                      {t(getStatusTranslationKey(order.status), lang)}
                        </span>
                  </div>
                  {order.scheduledTime && (
                    <div className="mt-2 text-sm text-gray-500">
                      {t('scheduledFor', lang)}: {new Date(order.scheduledTime).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
        </div>
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
      </div>
    </div>
  );
};

export default Interface1;