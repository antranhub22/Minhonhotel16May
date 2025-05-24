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
  type MenuKey = 'tours' | 'bus' | 'vehicle' | 'currency' | 'laundry' | 'homestay';
  const [activeMenu, setActiveMenu] = useState<MenuKey>('tours');

  // State để điều khiển popup infographic
  const [showInfographic, setShowInfographic] = useState(false);

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

  // Thêm biến ánh xạ iconMap
  const iconMap = {
    tours: travelTourIcons,
    bus: busTicketIcons,
    vehicle: vehicleRentalIcons,
    currency: currencyIcons,
    laundry: laundryIcons,
    homestay: homestayIcons,
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

  // Khi nhấn icon, set activeIcon và showReference (nếu nhấn lại icon đang chọn thì bỏ chọn)
  const handleIconClick = (iconName: string) => {
    if (activeIcon === iconName && showReference) {
      setActiveIcon(null);
      setShowReference(false);
    } else {
      setActiveIcon(iconName);
      // Chỉ show reference nếu icon có media
      const media = iconMediaMap[iconName];
      if (Array.isArray(media) ? media.length > 0 : (media && typeof media === 'object' && 'src' in media)) {
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
    if (media && typeof media === 'object' && 'src' in media) return [media];
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

  // 1. HEADER: Đưa avatar sang phải, menu/hướng dẫn sang trái, thêm tiêu đề lớn dưới header
  const Header = () => (
    <div className="flex items-center justify-between w-full mb-4">
      <button onClick={() => setShowInfographic(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200">
        <span className="material-icons text-2xl text-amber-400">menu</span>
      </button>
      <h1 className="text-2xl font-bold text-amber-300 text-center flex-1">{t('simplify_travels', lang)}</h1>
      <img src="/path/to/avatar.jpg" alt="avatar" className="w-10 h-10 rounded-full border-2 border-amber-300 object-cover" />
    </div>
  );

  // 2. TABS: Style lại thanh menu ngang thành tab bo tròn, scroll ngang
  const TabBar = () => (
    <div className="flex flex-row flex-nowrap overflow-x-auto whitespace-nowrap gap-2 bg-white/10 rounded-lg p-1 shadow no-scrollbar mb-4">
      <button onClick={() => setActiveMenu('tours')} className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm ${activeMenu==='tours' ? 'bg-amber-400 text-pink-900 shadow' : 'bg-transparent text-amber-300'}`}>Tours</button>
      <button onClick={() => setActiveMenu('bus')} className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm ${activeMenu==='bus' ? 'bg-amber-400 text-pink-900 shadow' : 'bg-transparent text-amber-300'}`}>Bus Tickets</button>
      <button onClick={() => setActiveMenu('vehicle')} className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm ${activeMenu==='vehicle' ? 'bg-amber-400 text-pink-900 shadow' : 'bg-transparent text-amber-300'}`}>Vehicle Rental</button>
      <button onClick={() => setActiveMenu('currency')} className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm ${activeMenu==='currency' ? 'bg-amber-400 text-pink-900 shadow' : 'bg-transparent text-amber-300'}`}>Currency Exchange</button>
      <button onClick={() => setActiveMenu('laundry')} className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm ${activeMenu==='laundry' ? 'bg-amber-400 text-pink-900 shadow' : 'bg-transparent text-amber-300'}`}>Laundry Service</button>
      <button onClick={() => setActiveMenu('homestay')} className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm ${activeMenu==='homestay' ? 'bg-amber-400 text-pink-900 shadow' : 'bg-transparent text-amber-300'}`}>Homestay</button>
    </div>
  );

  // 3. ICON GROUP: Style lại icon group cho bo tròn, nhỏ gọn, đặt phía trên card
  const IconGroup = () => (
    <div className="flex flex-row gap-2 mb-2 justify-center">
      {iconMap[activeMenu] && renderIconGroup(iconMap[activeMenu], iconMap[activeMenu].length, 20)}
    </div>
  );

  // 4. CARD DỊCH VỤ: Style lại card/reference: ảnh lớn, overlay, tag, nút heart/arrow, slider ngang
  const ServiceCard = ({ refItem }: { refItem: ReferenceItem }) => (
    <div className="relative min-w-[280px] max-w-xs rounded-2xl shadow-lg overflow-hidden bg-white/90">
      <img src={refItem.image && typeof refItem.image === 'string' ? refItem.image : hotelImage} alt={refItem.title || 'Service'} className="w-full h-40 object-cover" />
      <div className="absolute top-2 left-2 flex gap-1">
        <span className="bg-amber-400 text-xs font-bold px-2 py-1 rounded-full">AI</span>
        <span className="bg-blue-400 text-xs font-bold px-2 py-1 rounded-full">3 Days</span>
        <span className="bg-pink-400 text-xs font-bold px-2 py-1 rounded-full">{t('tour_package', lang)}</span>
      </div>
      <button className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow"><span className="material-icons text-pink-500">favorite_border</span></button>
      <div className="absolute bottom-2 right-2 bg-amber-400 rounded-full p-2 shadow"><span className="material-icons text-pink-900">arrow_outward</span></div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-pink-900 mb-1">{refItem.title}</h3>
        <p className="text-sm text-gray-700 mb-2">{refItem.description}</p>
      </div>
    </div>
  );

  // 5. NÚT CHAT AI: Style lại nút gọi AI cho lớn, glow, fixed bottom center
  const CallButton = () => (
    <button className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-full shadow-lg text-lg font-bold flex items-center gap-2 animate-pulse z-50" onClick={() => handleCall(lang as any)}>
      <span className="material-icons text-3xl mr-2">auto_mode</span>
      {t('chat_with_ai', lang)}
    </button>
  );

  return (
    <div 
      className={`absolute w-full min-h-screen h-full transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-10 overflow-y-auto`} 
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
        {/* --- LAYOUT MỚI MOBILE --- */}
        <Header />
        <TabBar />
        <IconGroup />
        {activeIcon && iconMediaMap[activeIcon] && iconMediaMap[activeIcon].length > 0 && (
          <div className="w-full overflow-x-auto flex flex-row gap-4 pb-4">
            {iconMediaMap[activeIcon].map((media, idx) => (
              <div key={idx} className="min-w-[280px] max-w-xs rounded-2xl shadow-lg overflow-hidden bg-white/90">
                <img src={media.src} alt={media.alt || ''} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-2">{media.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeIcon && (
          <div className="w-full overflow-x-auto flex flex-row gap-4 pb-4">
            {references.filter(ref => ref.keywords && ref.keywords.includes(activeIcon)).map((ref, idx) => (
              <ServiceCard key={ref.id || idx} refItem={ref} />
            ))}
          </div>
        )}
        <CallButton />
        {/* --- END LAYOUT MỚI --- */}
        {/* Các block giao diện cũ đã được loại bỏ để layout mới hiển thị rõ ràng */}
      </div>
    </div>
  );
};

export default Interface1;