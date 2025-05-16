import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ReferenceSwiperProps {
  filteredReferences: any[];
  renderReferenceCard: (reference: any) => React.ReactNode;
  getSlidesPerView: () => number | 'auto';
}

const ReferenceSwiper: React.FC<ReferenceSwiperProps> = ({ filteredReferences, renderReferenceCard, getSlidesPerView }) => (
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
);

export default ReferenceSwiper; 