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
import { startCall, getVapiInstance, initVapi, isVapiInitialized } from '../lib/vapiClient';

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

const SiriButtonWrapper: React.FC<{ language: string }> = ({ language }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isCalling, setIsCalling] = useState(false);

  // Hàm lấy assistantId theo ngôn ngữ
  const getAssistantId = () => {
    return language === 'fr'
      ? import.meta.env.VITE_VAPI_ASSISTANT_ID_FR
      : language === 'zh'
        ? import.meta.env.VITE_VAPI_ASSISTANT_ID_ZH
        : language === 'ru'
          ? import.meta.env.VITE_VAPI_ASSISTANT_ID_RU
          : language === 'ko'
            ? import.meta.env.VITE_VAPI_ASSISTANT_ID_KO
            : import.meta.env.VITE_VAPI_ASSISTANT_ID;
  };

  useEffect(() => {
    if (ref.current) {
      const siri = new SiriButton(ref.current.id);
      return () => siri.cleanup();
    }
  }, []);

  // Hàm xử lý khi nhấn SiriButton
  const handlePress = async () => {
    if (isCalling) return;
    setIsCalling(true);
    try {
      // Đảm bảo đã init vapi
      if (!isVapiInitialized()) {
        await initVapi(import.meta.env.VITE_VAPI_PUBLIC_KEY || 'demo');
      }
      const assistantId = getAssistantId();
      if (!assistantId) throw new Error('Assistant ID not configured');
      await startCall(assistantId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to start Vapi call:', err);
    } finally {
      setTimeout(() => setIsCalling(false), 2000); // Đợi 2s rồi cho phép gọi lại
    }
  };

  return (
    <div id="siri-btn-canvas" style={{ width: 72, height: 72, opacity: isCalling ? 0.6 : 1, pointerEvents: isCalling ? 'none' : 'auto' }} ref={ref} onClick={handlePress} aria-disabled={isCalling} tabIndex={0} role="button" aria-label="Press to Order" />
  );
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

  // State modal chi tiết
  const [modalMedia, setModalMedia] = useState<IconMedia | null>(null);

  // State bookmark
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('bookmarkedServices') || '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem('bookmarkedServices', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Hàm toggle bookmark
  const toggleBookmark = (media: IconMedia) => {
    setBookmarks(prev => {
      const key = media.src;
      if (prev.includes(key)) return prev.filter(k => k !== key);
      return [...prev, key];
    });
  };
  const isBookmarked = (media: IconMedia) => bookmarks.includes(media.src);

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
    <div className="flex flex-row gap-3 px-2 pb-3 overflow-x-auto no-scrollbar">
      {subIcons.map(icon => (
        <button
          key={icon}
          onClick={() => setSelectedSub(icon)}
          className={`flex flex-col items-center px-4 py-3 rounded-xl shadow transition-all duration-150
            ${selectedSub === icon ? 'bg-[var(--accent-yellow)] text-black scale-105 border-2 border-yellow-400 shadow-lg' : 'bg-card-bg text-white hover:bg-[var(--accent-yellow)] hover:text-black hover:scale-105'}
          `}
          style={{ minWidth: 80, minHeight: 80, touchAction: 'manipulation' }}
        >
          <div className="transition-transform duration-150">
            {ICON_COMPONENTS[icon] || <span className="material-icons text-2xl mb-1">star</span>}
          </div>
          <span className="text-sm font-semibold mt-2 text-center whitespace-nowrap" style={{lineHeight:1.15}}>{ICON_DISPLAY_NAMES[icon]}</span>
        </button>
      ))}
    </div>
  );

  // Render card dịch vụ từ mediaList
  const renderMediaCards = () => (
    <div className="flex flex-col gap-7 px-2 pb-28">
      {mediaList.length === 0 ? (
        <div className="text-center text-white py-12">Chọn một hạng mục để xem chi tiết.</div>
      ) : mediaList.map((media, idx) => (
        <div key={idx} className="bg-card-bg rounded-3xl shadow-lg p-4 cursor-pointer transition hover:scale-[1.025] hover:shadow-2xl relative" style={{boxShadow: 'var(--card-shadow)', minHeight: 180}} onClick={() => setModalMedia(media)}>
          <button
            className={`absolute top-3 right-3 z-10 p-2 rounded-full transition ${isBookmarked(media) ? 'bg-yellow-400 text-pink-900' : 'bg-black/30 text-white hover:bg-yellow-400 hover:text-pink-900'}`}
            onClick={e => { e.stopPropagation(); toggleBookmark(media); }}
            title={isBookmarked(media) ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
            style={{ minWidth: 40, minHeight: 40 }}
          >
            <span className="material-icons text-xl">bookmark{isBookmarked(media) ? '' : '_border'}</span>
          </button>
          <div className="h-40 bg-gray-700 rounded-2xl mb-3 overflow-hidden flex items-center justify-center">
            <img src={media.src} alt={media.alt || ''} className="object-cover w-full h-full rounded-2xl" loading="lazy" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1" style={{fontSize: '1.15rem'}}>{media.alt}</h3>
          <p className="text-gray-300 text-base mb-2 whitespace-pre-line" style={{fontSize: '1rem'}}>{media.description}</p>
        </div>
      ))}
    </div>
  );

  // State modal bookmark
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  // Lấy danh sách media đã bookmark (tìm trong iconMediaMap)
  const allMedia = Object.values(iconMediaMap).flat();
  const bookmarkedMedia = allMedia.filter(m => bookmarks.includes(m.src));

  // State filter cho bookmark
  const [bookmarkFilter, setBookmarkFilter] = useState('');

  // Lọc bookmark theo filter
  const filteredBookmarkedMedia = bookmarkedMedia.filter(media =>
    (media.alt?.toLowerCase() || '').includes(bookmarkFilter.toLowerCase()) ||
    (media.description?.toLowerCase() || '').includes(bookmarkFilter.toLowerCase())
  );

  // Focus trap & ESC cho modal chi tiết
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!modalMedia) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalMedia(null);
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    setTimeout(() => { // focus nút đóng đầu tiên
      modalRef.current?.querySelector<HTMLElement>('button')?.focus();
    }, 100);
    return () => document.removeEventListener('keydown', handleKey);
  }, [modalMedia]);

  // Focus trap & ESC cho modal bookmark
  const bookmarkModalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showBookmarkModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowBookmarkModal(false);
      if (e.key === 'Tab' && bookmarkModalRef.current) {
        const focusable = bookmarkModalRef.current.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    setTimeout(() => {
      bookmarkModalRef.current?.querySelector<HTMLElement>('button')?.focus();
    }, 100);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showBookmarkModal]);

  // Render modal chi tiết (tối ưu mobile)
  const renderModal = () => modalMedia && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadein" onClick={() => setModalMedia(null)}>
      <div ref={modalRef} className="bg-card-bg rounded-2xl shadow-2xl p-4 max-w-md w-[96vw] relative animate-scalein" style={{maxHeight: '92vh', overflowY: 'auto'}} onClick={e => e.stopPropagation()} tabIndex={-1} aria-modal="true" role="dialog">
        <button aria-label="Đóng chi tiết dịch vụ" className="absolute top-2 right-2 text-white bg-black/30 rounded-full p-2 hover:bg-black/60" style={{minWidth: 40, minHeight: 40}} onClick={() => setModalMedia(null)}>
          <span className="material-icons text-2xl">close</span>
        </button>
        <button
          aria-label={isBookmarked(modalMedia) ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
          className={`absolute top-2 left-2 z-10 p-2 rounded-full transition ${isBookmarked(modalMedia) ? 'bg-yellow-400 text-pink-900' : 'bg-black/30 text-white hover:bg-yellow-400 hover:text-pink-900'}`}
          style={{minWidth: 40, minHeight: 40}}
          onClick={e => { e.stopPropagation(); toggleBookmark(modalMedia); }}
          title={isBookmarked(modalMedia) ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
        >
          <span className="material-icons text-xl">bookmark{isBookmarked(modalMedia) ? '' : '_border'}</span>
        </button>
        <div className="w-full h-56 bg-gray-700 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
          <img src={modalMedia.src} alt={modalMedia.alt || ''} className="object-cover w-full h-full rounded-xl" loading="lazy" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2" style={{fontSize: '1.2rem'}}>{modalMedia.alt}</h3>
        <p className="text-gray-200 text-base whitespace-pre-line" style={{fontSize: '1.05rem'}}>{modalMedia.description}</p>
      </div>
    </div>
  );

  // Render modal bookmark (tối ưu mobile, thêm filter)
  const renderBookmarkModal = () => showBookmarkModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadein" onClick={() => setShowBookmarkModal(false)}>
      <div ref={bookmarkModalRef} className="bg-card-bg rounded-2xl shadow-2xl p-4 max-w-md w-[96vw] relative max-h-[92vh] overflow-y-auto animate-scalein" onClick={e => e.stopPropagation()} tabIndex={-1} aria-modal="true" role="dialog">
        <button aria-label="Đóng danh sách bookmark" className="absolute top-2 right-2 text-white bg-black/30 rounded-full p-2 hover:bg-black/60" style={{minWidth: 40, minHeight: 40}} onClick={() => setShowBookmarkModal(false)}>
          <span className="material-icons text-2xl">close</span>
        </button>
        <h2 className="text-xl font-bold text-white mb-4 text-center">Dịch vụ đã lưu</h2>
        <input
          type="text"
          value={bookmarkFilter}
          onChange={e => setBookmarkFilter(e.target.value)}
          placeholder="Tìm kiếm dịch vụ..."
          className="w-full mb-4 px-3 py-2 rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          style={{fontSize: '1rem'}}
        />
        {filteredBookmarkedMedia.length === 0 ? (
          <div className="text-center text-gray-300 py-8">Không tìm thấy dịch vụ phù hợp.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredBookmarkedMedia.map((media, idx) => (
              <div key={idx} className="bg-black/20 rounded-xl p-3 flex gap-3 items-center relative" style={{minHeight: 80}}>
                <img src={media.src} alt={media.alt || ''} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate" style={{fontSize: '1rem'}}>{media.alt}</div>
                  <div className="text-xs text-gray-300 truncate" style={{fontSize: '0.95rem'}}>{media.description?.split('\n')[0]}</div>
                </div>
                <button
                  aria-label={isBookmarked(media) ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
                  className={`ml-2 p-1 rounded-full transition ${isBookmarked(media) ? 'bg-yellow-400 text-pink-900' : 'bg-black/30 text-white hover:bg-yellow-400 hover:text-pink-900'}`}
                  style={{minWidth: 36, minHeight: 36}}
                  onClick={() => toggleBookmark(media)}
                  title={isBookmarked(media) ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
                >
                  <span className="material-icons text-xl">bookmark{isBookmarked(media) ? '' : '_border'}</span>
                </button>
                <button
                  aria-label="Xem chi tiết dịch vụ"
                  className="ml-2 p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                  style={{minWidth: 36, minHeight: 36}}
                  onClick={() => { setModalMedia(media); setShowBookmarkModal(false); }}
                  title="Xem chi tiết"
                >
                  <span className="material-icons text-xl">open_in_new</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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
      {/* Modal chi tiết dịch vụ */}
      {renderModal()}
      {/* Modal bookmark */}
      {renderBookmarkModal()}

      {/* Thanh điều hướng dưới */}
      <nav className="fixed bottom-0 left-0 w-full flex items-center justify-around bg-card-bg py-3 px-6 rounded-t-3xl shadow-2xl" style={{boxShadow: 'var(--card-shadow)'}}>
        <button className="flex flex-col items-center">
          <span className="material-icons text-white text-2xl">home</span>
        </button>
        {/* Thay Chat With AI bằng SiriButton */}
        <div className="flex flex-col items-center">
          <SiriButtonWrapper language={language} />
          <span className="text-xs text-white font-semibold mt-1">Press to Order</span>
        </div>
        <button className="flex flex-col items-center relative" onClick={() => setShowBookmarkModal(true)}>
          <span className="material-icons text-white text-2xl">bookmark_border</span>
          {bookmarks.length > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-pink-900 rounded-full px-1 text-xs font-bold">{bookmarks.length}</span>}
        </button>
      </nav>
    </div>
  );
};

export default VoiceAssistant;
