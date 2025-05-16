/// <reference types="react" />
import React, { useState, useEffect } from 'react';
import type { ReferenceItem } from '@/services/ReferenceService';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ChevronDown } from 'lucide-react';
import { FaBookOpen } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';

const CATEGORIES = [
  'Landmark',
  'Hotel Amenities',
  'Local Cuisine',
  'Area Map',
  'Activity and Experiences',
  'Tours',
  'Transportation',
  'Dining'
];

interface ReferenceProps {
  references: ReferenceItem[];
}

interface DocContents {
  [key: string]: string;
}

const Reference = ({ references }: ReferenceProps): JSX.Element => {
  const [docContents, setDocContents] = useState<DocContents>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let fetchCount = 0;
    let errorCount = 0;

    if (references.length === 0) {
      setLoading(false);
      return;
    }

    references.forEach((ref: ReferenceItem) => {
      if ((ref as any).type === 'document' && ref.url.endsWith('.txt') && !docContents[ref.url]) {
        fetch(ref.url)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch document: ${res.statusText}`);
            }
            return res.text();
          })
          .then(text => {
            setDocContents((prev: DocContents) => ({ ...prev, [ref.url]: text }));
            fetchCount++;
            if (fetchCount + errorCount === references.length) {
              setLoading(false);
            }
          })
          .catch((err) => {
            console.error(`Error fetching document ${ref.url}:`, err);
            errorCount++;
            if (fetchCount + errorCount === references.length) {
              setLoading(false);
              setError('Some documents could not be loaded. Please try again later.');
            }
          });
      } else {
        fetchCount++;
        if (fetchCount + errorCount === references.length) {
          setLoading(false);
        }
      }
    });

    if (references.every(ref => (ref as any).type !== 'document' || !ref.url.endsWith('.txt'))) {
      setLoading(false);
    }
  }, [references]);

  const getAssetUrl = (url: string) => {
    if (/^https?:\/\//.test(url)) return url;
    const path = url.replace(/^\//, '');
    return `${import.meta.env.BASE_URL}${path}`;
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(getAssetUrl(url));
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(getAssetUrl(url), '_blank');
  };

  // Skeleton loading card
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white/80 rounded-xl shadow-md h-[180px] flex flex-col p-4 gap-2">
      <div className="bg-gray-200 rounded w-full h-2/3 mb-2"></div>
      <div className="bg-gray-200 rounded w-2/3 h-4 mb-1"></div>
      <div className="bg-gray-100 rounded w-1/2 h-3"></div>
    </div>
  );

  // Card rendering
  const renderReferenceCard = (reference: ReferenceItem) => {
    return (
      <div
        className="group bg-white/90 rounded-xl shadow-md h-[180px] flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-95 hover:shadow-xl border border-white/40 backdrop-blur-md focus-within:ring-2 focus-within:ring-blue-400"
        style={{ minWidth: 220, maxWidth: 260 }}
        onClick={() => (reference as any).type === 'link' ? handleOpenLink(reference.url) : undefined}
        tabIndex={0}
      >
        {/* Thumbnail */}
        <div className="flex-1 flex items-center justify-center overflow-hidden rounded-t-xl transition-all duration-200 group-hover:shadow-lg" style={{ height: '60%' }}>
          {(reference as any).type === 'image' && (
            <picture>
              <source srcSet={getAssetUrl(reference.url).replace(/\.(jpe?g|png)$/i, '.webp')} type="image/webp" />
              <img
                src={getAssetUrl(reference.url)}
                alt={reference.title}
                className="object-cover w-full h-full rounded-t-xl hover:opacity-80 transition-all duration-200 cursor-zoom-in"
                onClick={e => { e.stopPropagation(); setLightboxImg(getAssetUrl(reference.url)); }}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setLightboxImg(getAssetUrl(reference.url)); } }}
                loading="lazy"
              />
            </picture>
          )}
          {(reference as any).type === 'document' && reference.url.endsWith('.pdf') && (
            <span className="material-icons text-5xl text-blue-700/80">picture_as_pdf</span>
          )}
          {(reference as any).type === 'document' && reference.url.endsWith('.txt') && (
            <span className="material-icons text-5xl text-green-700/80">description</span>
          )}
          {(reference as any).type === 'link' && (
            <span className="material-icons text-5xl text-yellow-700/80">link</span>
          )}
        </div>
        {/* Text content */}
        <div className="flex flex-col gap-1 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-gray-900 truncate">{reference.title}</span>
            {(reference as any).type === 'document' && (
              <button
                onClick={e => { e.stopPropagation(); handleDownload(reference.url, reference.title); }}
                className="ml-auto p-1 rounded-full hover:bg-yellow-100 text-yellow-700 transition-colors transition-all duration-200 focus:ring-2 focus:ring-yellow-400"
                tabIndex={0}
                aria-label="Tải xuống tài liệu"
              >
                <span className="material-icons text-base">download</span>
              </button>
            )}
            {(reference as any).type === 'link' && (
              <span className="material-icons text-xs text-gray-400 ml-1">open_in_new</span>
            )}
          </div>
          {reference.description && (
            <span className="text-xs text-gray-500 truncate">{reference.description}</span>
          )}
          {/* Inline preview for .txt */}
          {reference.url.endsWith('.txt') && docContents[reference.url] && (
            <pre className="mt-1 max-h-12 overflow-auto whitespace-pre-wrap text-xs text-gray-700 bg-gray-50 rounded p-1">{docContents[reference.url].slice(0, 120)}...</pre>
          )}
        </div>
      </div>
    );
  };

  // Responsive breakpoints
  const getSlidesPerView = () => {
    if (window.innerWidth < 640) return 'auto'; // mobile: cuốn auto
    if (window.innerWidth < 1024) return 2;
    if (window.innerWidth < 1280) return 3;
    return 4;
  };

  // Lọc reference theo category, không phân biệt hoa thường và loại bỏ dấu cách thừa
  const filteredReferences = references.filter(ref => (ref as any).category && (ref as any).category.trim().toLowerCase() === activeCategory.trim().toLowerCase());

  // Main render
  return (
    <div className="w-full max-w-5xl mx-auto mt-2 mb-2 px-2 py-3 rounded-2xl" style={{ background: 'rgba(85,154,154,0.85)', minHeight: 260 }}>
      {/* Lightbox modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <button
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg z-10 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              onClick={e => { e.stopPropagation(); setLightboxImg(null); }}
              aria-label="Đóng lightbox"
            >
              <span className="material-icons text-2xl">close</span>
            </button>
            <picture>
              <source srcSet={lightboxImg ? lightboxImg.replace(/\.(jpe?g|png)$/i, '.webp') : ''} type="image/webp" />
              <img
                src={lightboxImg || ''}
                alt="Phóng to ảnh reference"
                className="rounded-xl max-h-[80vh] w-auto object-contain border-4 border-white shadow-2xl transition-all duration-300"
                onClick={e => e.stopPropagation()}
                loading="lazy"
              />
            </picture>
          </div>
        </div>
      )}
      
      {/* Dropdown category - phong cách mới giống Interface1 */}
      <div className="flex items-center mb-4 px-2">
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
          <FaBookOpen className="text-[#F9BF3B] text-xl mr-1.5"
            style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
          />
          <label className="mr-2 font-semibold font-sans text-white whitespace-nowrap text-sm sm:text-base">Category:</label>
          <div className="relative flex-1">
            <select
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value)}
              className="appearance-none w-full pl-6 sm:pl-8 pr-6 py-1 sm:py-1.5 font-sans bg-transparent focus:outline-none transition-all duration-200"
              style={{
                fontWeight: 600,
                color: '#fff',
                textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
                borderRadius: '8px'
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-blue-800 text-white">{cat}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#F9BF3B] pointer-events-none text-lg" />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading references...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && filteredReferences.length === 0 ? (
        <div className="flex items-center justify-center h-[120px] text-white/80 text-base font-medium">No references available</div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={16}
          slidesPerView={getSlidesPerView()}
          navigation={filteredReferences.length > 3}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="w-full"
          style={{ paddingBottom: 32 }}
        >
          {filteredReferences.map((reference, idx) => (
            <SwiperSlide key={reference.url + idx} className="flex justify-center" style={window.innerWidth < 640 ? {width: 240, maxWidth: 280, minWidth: 200} : {}}>
              {renderReferenceCard(reference)}
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default Reference;