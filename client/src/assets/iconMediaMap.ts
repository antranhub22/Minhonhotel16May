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

export const iconMediaMap: Record<string, IconMedia[]> = {
  tour_halfday: [
    { type: 'image', src: '/assets/tour_halfday/Fairy_Stream.jpg', alt: 'Fairy Stream', description: 'Ảnh Fairy Stream' },
    { type: 'image', src: '/assets/tour_halfday/Fishing_Village.jpg', alt: 'Fishing Village', description: 'Ảnh Fishing Village' },
    { type: 'image', src: '/assets/tour_halfday/Jeep.jpg', alt: 'Jeep', description: 'Ảnh Jeep' },
    { type: 'image', src: '/assets/tour_halfday/Jeep01.jpg', alt: 'Jeep01', description: 'Ảnh Jeep01' },
    { type: 'image', src: '/assets/tour_halfday/Jeep02.jpg', alt: 'Jeep02', description: 'Ảnh Jeep02' },
    { type: 'image', src: '/assets/tour_halfday/Red_Sand_Dune.jpg', alt: 'Red Sand Dune', description: 'Ảnh Red Sand Dune' },
    { type: 'image', src: '/assets/tour_halfday/Red_Sand_Dune01.jpg', alt: 'Red Sand Dune01', description: 'Ảnh Red Sand Dune01' }
  ],
  tour_fullday: [
    { type: 'video', src: '/assets/tour_fullday/6627467707052.mp4', alt: 'Video Tour Full Day', description: 'Video tour full day' },
    { type: 'image', src: '/assets/tour_fullday/Jeep03.jpg', alt: 'Jeep03', description: 'Ảnh Jeep03' },
    { type: 'image', src: '/assets/tour_fullday/Jeep04.jpg', alt: 'Jeep04', description: 'Ảnh Jeep04' },
    { type: 'image', src: '/assets/tour_fullday/Jeep05.jpg', alt: 'Jeep05', description: 'Ảnh Jeep05' },
    { type: 'image', src: '/assets/tour_fullday/Sand_surfing.jpg', alt: 'Sand surfing', description: 'Ảnh Sand surfing' },
    { type: 'image', src: '/assets/tour_fullday/White-Sand_Dune.jpg', alt: 'White Sand Dune', description: 'Ảnh White Sand Dune' }
  ],
  tour_multiday: [],
  special_tour: [],
  // TOURISM & TOURS
  sand_dunes: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', alt: 'Sand Dunes 1', description: 'Demo: Cảnh đồi cát nổi tiếng ở Mũi Né.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80', alt: 'Sand Dunes 2', description: 'Demo: Trải nghiệm trượt cát và ngắm bình minh.' }
  ],
  sightseeing: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', alt: 'Sightseeing Demo 1', description: 'Demo: Tham quan các địa điểm nổi bật tại Phan Thiết.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'Sightseeing Demo 2', description: 'Demo: Khám phá các điểm du lịch mới.' }
  ],
  jeep_tour: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', alt: 'Jeep Tour 1', description: 'Demo: Tour xe Jeep khám phá đồi cát.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80', alt: 'Jeep Tour 2', description: 'Demo: Hành trình thú vị cùng xe Jeep.' }
  ],
  stream_beach: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', alt: 'Stream and Beach Demo 1', description: 'Demo: Khám phá suối và bãi biển đẹp.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=600&q=80', alt: 'Stream and Beach Demo 2', description: 'Demo: Tận hưởng không khí biển trong lành.' }
  ],
  // BUS TICKETS
  bus_hcm: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80', alt: 'Bus HCM Demo 1', description: 'Demo: Xe bus chất lượng cao tuyến Mũi Né - HCM.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', alt: 'Bus HCM Demo 2', description: 'Demo: Nội thất xe bus hiện đại.' }
  ],
  bus_dl: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'Bus Da Lat Demo 1', description: 'Demo: Xe bus tuyến Mũi Né - Đà Lạt, khởi hành hàng ngày.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80', alt: 'Bus Da Lat Demo 2', description: 'Demo: Cảnh đẹp trên đường đi Đà Lạt.' }
  ],
  bus_nt: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80', alt: 'Bus Nha Trang Demo 1', description: 'Demo: Xe bus tuyến Mũi Né - Nha Trang.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'Bus Nha Trang Demo 2', description: 'Demo: Không gian xe bus rộng rãi.' }
  ],
  bus_dn: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', alt: 'Bus Da Nang Demo 1', description: 'Demo: Xe bus tuyến Mũi Né - Đà Nẵng.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80', alt: 'Bus Da Nang Demo 2', description: 'Demo: Dịch vụ tiện nghi trên xe.' }
  ],
  bus_ct: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80', alt: 'Bus Can Tho Demo 1', description: 'Demo: Xe bus tuyến Mũi Né - Cần Thơ.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', alt: 'Bus Can Tho Demo 2', description: 'Demo: Hành trình an toàn, thoải mái.' }
  ],
  bus_mt: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'Bus My Tho Demo 1', description: 'Demo: Xe bus tuyến Mũi Né - Mỹ Tho.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=600&q=80', alt: 'Bus My Tho Demo 2', description: 'Demo: Xe bus sạch sẽ, tiện nghi.' }
  ],
  bus_vt: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80', alt: 'Bus Vung Tau Demo 1', description: 'Demo: Xe bus tuyến Mũi Né - Vũng Tàu.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', alt: 'Bus Vung Tau Demo 2', description: 'Demo: Phong cảnh biển trên đường đi.' }
  ],
  bus_other: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=600&q=80', alt: 'Other Bus Demo 1', description: 'Demo: Các tuyến bus khác.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80', alt: 'Other Bus Demo 2', description: 'Demo: Xe bus phục vụ nhiều tuyến.' }
  ],
  // VEHICLE RENTAL
  motorcycle: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80', alt: 'Motorcycle Rental Demo 1', description: 'Demo: Dịch vụ thuê xe máy.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', alt: 'Motorcycle Rental Demo 2', description: 'Demo: Xe máy đời mới, tiết kiệm xăng.' }
  ],
  car_driver: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', alt: 'Car Rental with Driver Demo 1', description: 'Demo: Thuê xe ô tô có tài xế.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'Car Rental with Driver Demo 2', description: 'Demo: Xe rộng rãi, tài xế chuyên nghiệp.' }
  ],
  car_self: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80', alt: 'Car Rental Self-drive Demo 1', description: 'Demo: Thuê xe tự lái.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=600&q=80', alt: 'Car Rental Self-drive Demo 2', description: 'Demo: Xe tự lái đa dạng mẫu mã.' }
  ],
  vehicle_special: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=600&q=80', alt: 'Special Vehicle Rental Demo 1', description: 'Demo: Thuê xe đặc biệt.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80', alt: 'Special Vehicle Rental Demo 2', description: 'Demo: Xe phục vụ sự kiện, nhóm đông.' }
  ],
  // CURRENCY EXCHANGE
  usd: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', alt: 'USD Exchange Demo 1', description: 'Demo: Đổi tiền USD.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'USD Exchange Demo 2', description: 'Demo: Giao dịch nhanh chóng, an toàn.' }
  ],
  eur: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'EUR Exchange Demo 1', description: 'Demo: Đổi tiền EUR.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80', alt: 'EUR Exchange Demo 2', description: 'Demo: Tỷ giá cạnh tranh.' }
  ],
  gbp: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80', alt: 'GBP Exchange Demo 1', description: 'Demo: Đổi tiền GBP.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80', alt: 'GBP Exchange Demo 2', description: 'Demo: Đổi tiền nhanh, tiện lợi.' }
  ],
  sgd: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', alt: 'SGD Exchange Demo 1', description: 'Demo: Đổi tiền SGD.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', alt: 'SGD Exchange Demo 2', description: 'Demo: Hỗ trợ nhiều loại ngoại tệ.' }
  ],
  jpy: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80', alt: 'JPY Exchange Demo 1', description: 'Demo: Đổi tiền JPY.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80', alt: 'JPY Exchange Demo 2', description: 'Demo: Đổi tiền Nhật Bản uy tín.' }
  ],
  krw: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', alt: 'KRW Exchange Demo 1', description: 'Demo: Đổi tiền KRW.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=600&q=80', alt: 'KRW Exchange Demo 2', description: 'Demo: Đổi tiền Hàn Quốc nhanh chóng.' }
  ],
  rub: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=600&q=80', alt: 'RUB Exchange Demo 1', description: 'Demo: Đổi tiền RUB.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'RUB Exchange Demo 2', description: 'Demo: Đổi tiền Nga tiện lợi.' }
  ],
  currency_other: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'Other Currency Demo 1', description: 'Demo: Đổi các loại tiền khác.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', alt: 'Other Currency Demo 2', description: 'Demo: Đổi ngoại tệ đa dạng.' }
  ],
  // LAUNDRY SERVICE
  laundry_regular: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', alt: 'Regular Laundry Demo 1', description: 'Demo: Giặt ủi thông thường.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', alt: 'Regular Laundry Demo 2', description: 'Demo: Dịch vụ giặt ủi sạch sẽ.' }
  ],
  laundry_special: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', alt: 'Special Laundry Demo 1', description: 'Demo: Giặt ủi đặc biệt.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', alt: 'Special Laundry Demo 2', description: 'Demo: Giặt ủi cho đồ cao cấp.' }
  ],
  laundry_express: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', alt: 'Express Laundry Demo 1', description: 'Demo: Giặt ủi nhanh.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80', alt: 'Express Laundry Demo 2', description: 'Demo: Giao đồ nhanh trong ngày.' }
  ],
  laundry_additional: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=600&q=80', alt: 'Additional Laundry Demo 1', description: 'Demo: Dịch vụ giặt ủi bổ sung.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'Additional Laundry Demo 2', description: 'Demo: Nhận giặt ủi tận nơi.' }
  ],
  // HOMESTAY SERVICE
  homestay_300k: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80', alt: 'Homestay <300k Demo 1', description: 'Demo: Homestay giá dưới 300k.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', alt: 'Homestay <300k Demo 2', description: 'Demo: Phòng sạch sẽ, tiện nghi.' }
  ],
  homestay_300_600k: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'Homestay 300-600k Demo 1', description: 'Demo: Homestay giá 300k-600k.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80', alt: 'Homestay 300-600k Demo 2', description: 'Demo: Không gian rộng rãi, thoáng mát.' }
  ],
  homestay_600k: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80', alt: 'Homestay >600k Demo 1', description: 'Demo: Homestay giá trên 600k.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', alt: 'Homestay >600k Demo 2', description: 'Demo: Dịch vụ cao cấp, sang trọng.' }
  ],
  homestay_longterm: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', alt: 'Homestay Longterm Demo 1', description: 'Demo: Homestay dài hạn.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', alt: 'Homestay Longterm Demo 2', description: 'Demo: Giá ưu đãi cho thuê dài hạn.' }
  ],
  homestay_additional: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', alt: 'Homestay Additional Demo 1', description: 'Demo: Dịch vụ homestay bổ sung.' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=600&q=80', alt: 'Homestay Additional Demo 2', description: 'Demo: Hỗ trợ khách hàng 24/7.' }
  ],
}; 