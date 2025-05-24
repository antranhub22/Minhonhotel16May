import React, { useEffect, useState, useRef } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import Interface1 from './Interface1';
import Interface2 from './Interface2';
import Interface3 from './Interface3';
import Interface3Vi from './Interface3Vi';
import Interface3Fr from './Interface3Fr';
import Interface4 from './Interface4';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Link } from 'wouter';
import { History, Sun, CalendarDays, CalendarCheck, Star, Bus, Mountain, Umbrella, Landmark, Ship, Waves, Map, ArrowRightLeft, Bike, CarFront, Car, DollarSign, Euro, Coins, Shirt, Sparkles, Plus, Home as HomeIcon, Building2, KeyRound, UserRound } from 'lucide-react';
import InfographicSteps from './InfographicSteps';
import { iconMediaMap, IconMedia } from '../assets/iconMediaMap';
import { SiriButton } from './SiriButton';

const API_HOST = import.meta.env.VITE_API_HOST || '';

const SERVICE_GROUPS = [
  { key: 'tours', label: 'Tours', icons: ['tour_halfday', 'tour_fullday', 'tour_multiday', 'special_tour'] },
  { key: 'bus', label: 'Bus Tickets', icons: ['bus_hcm', 'bus_dl', 'bus_nt', 'bus_dn', 'bus_ct', 'bus_mt', 'bus_vt', 'bus_other'] },
  { key: 'vehicle', label: 'Vehicle Rental', icons: ['motorcycle', 'car_driver', 'car_self'] },
  { key: 'currency', label: 'Currency Exchange', icons: ['usd', 'eur', 'krw', 'rub', 'currency_other'] },
  { key: 'laundry', label: 'Laundry Service', icons: ['laundry_regular', 'laundry_special', 'laundry_express', 'laundry_additional'] },
  { key: 'homestay', label: 'Homestay', icons: ['homestay_300k', 'homestay_300_600k', 'homestay_600k', 'homestay_longterm', 'homestay_fullhouse', 'homestay_additional'] },
];

const ICON_DISPLAY_NAMES: Record<string, string> = {
  tour_halfday: 'Half Day', tour_fullday: 'Full Day', tour_multiday: '2+ Days', special_tour: 'Special',
  bus_hcm: 'HCM', bus_dl: 'Dalat', bus_nt: 'Nha Trang', bus_dn: 'Da Nang', bus_ct: 'Can Tho', bus_mt: 'My Tho', bus_vt: 'Vung Tau', bus_other: 'Other',
  motorcycle: 'Motorbike', car_driver: 'Car+Driver', car_self: 'Self-drive',
  usd: 'USD', eur: 'EUR', krw: 'KRW', rub: 'RUB', currency_other: 'Other',
  laundry_regular: 'Regular', laundry_special: 'Special', laundry_express: 'Express', laundry_additional: 'Additional',
  homestay_300k: '<300k', homestay_300_600k: '300-600k', homestay_600k: '>600k', homestay_longterm: 'Long-term', homestay_fullhouse: 'Full House', homestay_additional: 'Additional',
};

const ICON_COMPONENTS: Record<string, JSX.Element> = {
  // TOURISM & TOURS
  tour_halfday: <Sun color="#FFC94A" size={28} strokeWidth={2} />,
  tour_fullday: <CalendarDays color="#FFC94A" size={28} strokeWidth={2} />,
  tour_multiday: <CalendarCheck color="#FFC94A" size={28} strokeWidth={2} />,
  special_tour: <Star color="#FFC94A" size={28} strokeWidth={2} />,
  // BUS TICKETS
  bus_hcm: <Bus color="#FFC94A" size={28} strokeWidth={2} />,
  bus_dl: <Mountain color="#FFC94A" size={28} strokeWidth={2} />,
  bus_nt: <Umbrella color="#FFC94A" size={28} strokeWidth={2} />,
  bus_dn: <Landmark color="#FFC94A" size={28} strokeWidth={2} />,
  bus_ct: <Ship color="#FFC94A" size={28} strokeWidth={2} />,
  bus_mt: <Waves color="#FFC94A" size={28} strokeWidth={2} />,
  bus_vt: <Map color="#FFC94A" size={28} strokeWidth={2} />,
  bus_other: <ArrowRightLeft color="#FFC94A" size={28} strokeWidth={2} />,
  // VEHICLE RENTAL
  motorcycle: <Bike color="#FFC94A" size={28} strokeWidth={2} />,
  car_driver: <CarFront color="#FFC94A" size={28} strokeWidth={2} />,
  car_self: <Car color="#FFC94A" size={28} strokeWidth={2} />,
  // CURRENCY EXCHANGE
  usd: <DollarSign color="#FFC94A" size={28} strokeWidth={2} />,
  eur: <Euro color="#FFC94A" size={28} strokeWidth={2} />,
  krw: <Coins color="#FFC94A" size={28} strokeWidth={2} />,
  rub: <Coins color="#FFC94A" size={28} strokeWidth={2} />,
  currency_other: <Coins color="#FFC94A" size={28} strokeWidth={2} />,
  // LAUNDRY SERVICE
  laundry_regular: <Shirt color="#FFC94A" size={28} strokeWidth={2} />,
  laundry_special: <Sparkles color="#FFC94A" size={28} strokeWidth={2} />,
  laundry_express: <Plus color="#FFC94A" size={28} strokeWidth={2} />,
  laundry_additional: <Plus color="#FFC94A" size={28} strokeWidth={2} />,
  // HOMESTAY SERVICE
  homestay_300k: <HomeIcon color="#FFC94A" size={28} strokeWidth={2} />,
  homestay_300_600k: <Building2 color="#FFC94A" size={28} strokeWidth={2} />,
  homestay_600k: <Building2 color="#FFC94A" size={28} strokeWidth={2} />,
  homestay_longterm: <CalendarDays color="#FFC94A" size={28} strokeWidth={2} />,
  homestay_fullhouse: <KeyRound color="#FFC94A" size={28} strokeWidth={2} />,
  homestay_additional: <UserRound color="#FFC94A" size={28} strokeWidth={2} />,
};

const SiriButtonWrapper: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (ref.current) {
      const siri = new SiriButton(ref.current.id);
      return () => siri.cleanup();
    }
  }, []);
  return <div id="siri-btn-canvas" style={{ width: 72, height: 72 }} ref={ref}></div>;
};

const VoiceAssistant: React.FC = () => {
  const { currentInterface, language } = useAssistant();
  
  // Initialize WebSocket connection
  useWebSocket();

  // State lưu danh sách dịch vụ (orders)
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State filter package
  const [selectedPackage, setSelectedPackage] = useState<'all' | 'flight' | 'hotel' | 'tour'>('all');

  // State dịch vụ chính và sub-item
  const [selectedService, setSelectedService] = useState('tours');
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/orders`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Hàm lấy orderType từ order (ưu tiên đúng trường backend)
  const getOrderType = (order: any) => {
    return (order.summary?.orderType || order.orderType || '').toLowerCase();
  };

  // Lọc orders theo package
  const filteredOrders = orders.filter(order => {
    if (selectedPackage === 'all') return true;
    const type = getOrderType(order);
    if (selectedPackage === 'flight') return type.includes('flight');
    if (selectedPackage === 'hotel') return type.includes('hotel');
    if (selectedPackage === 'tour') return type.includes('tour');
    return false;
  });

  // Khi đổi dịch vụ chính, reset sub-item
  useEffect(() => { setSelectedSub(null); }, [selectedService]);

  // Lấy danh sách sub-item cho dịch vụ đang chọn
  const subIcons = SERVICE_GROUPS.find(g => g.key === selectedService)?.icons || [];

  // Khi chọn sub-item, lấy media từ iconMediaMap
  const mediaList: IconMedia[] = selectedSub ? (iconMediaMap[selectedSub] || []) : [];

  // Render slider sub-item
  const renderSubSlider = () => (
    <div className="flex flex-row gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
      {subIcons.map(icon => (
        <button
          key={icon}
          onClick={() => setSelectedSub(icon)}
          className={`flex flex-col items-center px-3 py-2 rounded-xl shadow transition-all duration-150
            ${selectedSub === icon ? 'bg-[var(--accent-yellow)] text-black scale-105 border-2 border-yellow-400 shadow-lg' : 'bg-card-bg text-white hover:bg-[var(--accent-yellow)] hover:text-black hover:scale-105'}
          `}
          style={{ minWidth: 72, minHeight: 72 }}
        >
          <div className="transition-transform duration-150">
            {ICON_COMPONENTS[icon] || <span className="material-icons text-2xl mb-1">star</span>}
          </div>
          <span className="text-xs font-semibold mt-1 text-center whitespace-nowrap" style={{lineHeight:1.1}}>{ICON_DISPLAY_NAMES[icon]}</span>
        </button>
      ))}
    </div>
  );

  // Render card dịch vụ từ mediaList
  const renderMediaCards = () => (
    <div className="flex flex-col gap-6 px-4 pb-24">
      {mediaList.length === 0 ? (
        <div className="text-center text-white py-12">Chọn một hạng mục để xem chi tiết.</div>
      ) : mediaList.map((media, idx) => (
        <div key={idx} className="bg-card-bg rounded-3xl shadow-lg p-4" style={{boxShadow: 'var(--card-shadow)'}}>
          <div className="h-40 bg-gray-700 rounded-2xl mb-3 overflow-hidden flex items-center justify-center">
            <img src={media.src} alt={media.alt || ''} className="object-cover w-full h-full rounded-2xl" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{media.alt}</h3>
          <p className="text-gray-300 text-sm mb-2 whitespace-pre-line">{media.description}</p>
        </div>
      ))}
    </div>
  );

  // Hàm mapping order thành card UI
  const renderOrderCard = (order: any, idx: number) => {
    // Lấy thông tin cơ bản
    const title = order.summary?.items?.[0]?.name || order.summary?.orderType || order.orderType || 'Tour/Service';
    const description = order.summary?.items?.[0]?.description || order.summary?.specialInstructions || order.specialInstructions || '';
    const location = order.summary?.roomNumber || order.roomNumber || '';
    const image = '/assets/hotel-exterior.jpeg'; // Có thể mapping ảnh động sau
    const label = order.summary?.orderType || order.orderType || 'Tour Package';
    return (
      <div key={order.reference || idx} className="bg-card-bg rounded-3xl shadow-lg p-4 mb-6" style={{boxShadow: 'var(--card-shadow)'}}>
        <div className="h-40 bg-gray-700 rounded-2xl mb-3 overflow-hidden flex items-center justify-center">
          <img src={image} alt={title} className="object-cover w-full h-full rounded-2xl" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[var(--accent-yellow)] text-black text-xs font-bold px-2 py-1 rounded-full">{label}</span>
          <span className="bg-card-bg text-white text-xs font-bold px-2 py-1 rounded-full">{order.summary?.items?.length || 1} Days</span>
          <span className="bg-card-bg text-white text-xs font-bold px-2 py-1 rounded-full">AI</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-300 text-sm mb-2">{location}</p>
        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <button className="bg-[var(--accent-yellow)] rounded-full p-2 shadow">
            <span className="material-icons text-black text-xl">arrow_outward</span>
          </button>
          <button className="bg-card-bg rounded-full p-2 shadow">
            <span className="material-icons text-white text-xl">favorite_border</span>
          </button>
        </div>
      </div>
    );
  };

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

      {/* Menu dịch vụ chính */}
      <div className="flex flex-row gap-2 px-4 pb-3 overflow-x-auto">
        {SERVICE_GROUPS.map(g => (
          <button key={g.key} onClick={() => setSelectedService(g.key)} className={`px-4 py-2 rounded-full font-semibold shadow ${selectedService === g.key ? 'bg-[var(--accent-yellow)] text-black' : 'bg-card-bg text-white'}`}>{g.label}</button>
        ))}
      </div>
      {/* Slider sub-item */}
      {renderSubSlider()}
      {/* Danh sách card dịch vụ từ media động */}
      {renderMediaCards()}

      {/* Thanh điều hướng dưới */}
      <nav className="fixed bottom-0 left-0 w-full flex items-center justify-around bg-card-bg py-3 px-6 rounded-t-3xl shadow-2xl" style={{boxShadow: 'var(--card-shadow)'}}>
        <button className="flex flex-col items-center">
          <span className="material-icons text-white text-2xl">home</span>
        </button>
        {/* Thay Chat With AI bằng SiriButton */}
        <div className="flex flex-col items-center">
          <SiriButtonWrapper />
          <span className="text-xs text-white font-semibold mt-1">Press to Order</span>
        </div>
        <button className="flex flex-col items-center">
          <span className="material-icons text-white text-2xl">bookmark_border</span>
        </button>
      </nav>
    </div>
  );
};

export default VoiceAssistant;
