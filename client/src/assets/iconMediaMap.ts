// iconMediaMap.ts
// Ánh xạ iconName (sát nghĩa) sang media động tương ứng (ảnh, video, gif...)
// Bạn chỉ cần bổ sung file media vào thư mục /assets/icon-media/ và cập nhật object này

export type IconMediaType = 'image' | 'video' | 'gif';

export interface IconMedia {
  type: IconMediaType;
  src: string; // Đường dẫn tới file media
  alt?: string;
  description?: string;
}

export const iconMediaMap: Record<string, IconMedia | IconMedia[]> = {
  // TOURISM & TOURS
  sand_dunes: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', alt: 'Sand Dunes 1', description: 'Cảnh đồi cát nổi tiếng ở Mũi Né.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80', alt: 'Sand Dunes 2', description: 'Trải nghiệm trượt cát và ngắm bình minh.' }
  ],
  sightseeing: { type: 'image', src: '', alt: 'Phan Thiet Sightseeing', description: 'Tham quan các địa điểm nổi bật tại Phan Thiết.' },
  jeep_tour: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', alt: 'Jeep Tour 1', description: 'Tour xe Jeep khám phá đồi cát.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80', alt: 'Jeep Tour 2', description: 'Hành trình thú vị cùng xe Jeep.' }
  ],
  stream_beach: { type: 'image', src: '', alt: 'Stream and Beach Tour', description: 'Khám phá suối và bãi biển đẹp.' },
  special_tour: { type: 'image', src: '', alt: 'Special Tours', description: 'Các tour đặc biệt, trải nghiệm độc đáo.' },
  // BUS TICKETS
  bus_hcm: { type: 'image', src: '', alt: 'Mui Ne - Ho Chi Minh City Route', description: 'Xe bus chất lượng cao tuyến Mũi Né - HCM.' },
  bus_dl: { type: 'image', src: '', alt: 'Mui Ne - Da Lat Route', description: 'Xe bus tuyến Mũi Né - Đà Lạt, khởi hành hàng ngày.' },
  bus_nt: { type: 'image', src: '', alt: 'Mui Ne - Nha Trang Route', description: 'Xe bus tuyến Mũi Né - Nha Trang.' },
  bus_dn: { type: 'image', src: '', alt: 'Mui Ne - Da Nang Route', description: 'Xe bus tuyến Mũi Né - Đà Nẵng.' },
  bus_ct: { type: 'image', src: '', alt: 'Mui Ne - Can Tho Route', description: 'Xe bus tuyến Mũi Né - Cần Thơ.' },
  bus_mt: { type: 'image', src: '', alt: 'Mui Ne - My Tho Route', description: 'Xe bus tuyến Mũi Né - Mỹ Tho.' },
  bus_vt: { type: 'image', src: '', alt: 'Mui Ne - Vung Tau Route', description: 'Xe bus tuyến Mũi Né - Vũng Tàu.' },
  bus_other: { type: 'image', src: '', alt: 'Other Bus Routes', description: 'Các tuyến bus khác.' },
  // VEHICLE RENTAL
  motorcycle: { type: 'image', src: '', alt: 'Motorcycle Rental' },
  car_driver: { type: 'image', src: '', alt: 'Car Rental (with driver)' },
  car_self: { type: 'image', src: '', alt: 'Car Rental (self-drive)' },
  vehicle_special: { type: 'image', src: '', alt: 'Special Vehicle Rental' },
  // CURRENCY EXCHANGE
  usd: { type: 'image', src: '', alt: 'USD (US Dollar)' },
  eur: { type: 'image', src: '', alt: 'EUR (Euro)' },
  gbp: { type: 'image', src: '', alt: 'GBP (British Pound)' },
  jpy: { type: 'image', src: '', alt: 'JPY (Japanese Yen)' },
  rub: { type: 'image', src: '', alt: 'RUB (Russian Ruble)' },
  currency_exchange: { type: 'image', src: '', alt: 'Additional Currency Services' },
  currency_other: { type: 'image', src: '', alt: 'Additional Currency Services' },
  // LAUNDRY SERVICE
  laundry_regular: { type: 'image', src: '', alt: 'Regular Laundry Service' },
  laundry_special: { type: 'image', src: '', alt: 'Special Laundry Service' },
  laundry_express: { type: 'image', src: '', alt: 'Express Laundry Service' },
  laundry_additional: { type: 'image', src: '', alt: 'Additional Laundry Services' },
  // HOMESTAY SERVICE
  homestay_300k: { type: 'image', src: '', alt: 'Price Range/day: < 300k' },
  homestay_300_600k: { type: 'image', src: '', alt: 'Price Range/day: 300k - 600k' },
  homestay_600k: { type: 'image', src: '', alt: 'Price Range/day: Above 600k' },
  homestay_longterm: { type: 'image', src: '', alt: 'Long-term Rental' },
  homestay_additional: { type: 'image', src: '', alt: 'Additional Homestay Services' },
}; 