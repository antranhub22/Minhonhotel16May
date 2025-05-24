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
  // ================ BUS TICKETS ================
  bus_hcm: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80',
      alt: 'Bus HCM Demo 1',
      description: `Destination: Ho Chi Minh City\nPickup Point: Your hotel or main office in Mui Ne\nDeparture Time: Daily from 01:00 - 04:00 - 06:00 - 08:00 - 10:00 - 13:00 - 15:00 - 17:00 - 19:00 - 21:00 - 23:00\nTravel Time: ~4–5 hours\nBus Type: Limousine\nPrice: 320.000 VND`
    },
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
      alt: 'Bus HCM Demo 2',
      description: `Destination: Ho Chi Minh City\nPickup Point: Your hotel or main office in Mui Ne\nDeparture Time: Daly from 01:00 - 04:00 - 06:00 - 08:00 - 10:00 - 13:00 - 15:00 - 17:00 - 19:00 - 21:00 - 23:00\nTravel Time: ~4–5 hours\nBus Type: Sleeper Bus\nPrice: 260,000 VND`
    }
  ],
  bus_dl: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
      alt: 'Bus Da Lat Demo 1',
      description: `Destination: Da Lat\nPickup Point: Hotel pickup or Nguyễn Đình Chiểu Office\nDeparture Time: 06:30, 10:30, 12:00\nTravel Time: ~4.5–5 hours\nBus Type: Sleeper\nPrice: 150,000 – 250,000 VND`
    }
  ],
  bus_nt: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80',
      alt: 'Bus Nha Trang Demo 1',
      description: `Destination: Nha Trang\nPickup Point: Hotel or agency pickup\nDeparture Time: Morning & Afternoon trips\nTravel Time: ~4.5 hours\nBus Type: Sleeper, Limousine\nPrice: 180,000 – 300,000 VND`
    }
  ],
  bus_dn: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
      alt: 'Bus Da Nang Demo 1',
      description: `Destination: Da Nang\nPickup Point: 117 Nguyễn Đình Chiểu or hotel pickup\nDeparture Time: Evening trips\nTravel Time: ~10–11 hours\nBus Type: Sleeper, Limousine\nPrice: 530,000 – 590,000 VND`
    }
  ],
  // ================ VEHICLE RENTAL ================
  motorcycle: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80',
      alt: 'Motorbike Rental Demo 1',
      description: `Type: Motorbike\nRental Duration: Full-day | Multi-day\nPickup Location: Hotel or agency in Mui Ne\nRequired Documents: Passport\nPrice Range: 150,000 VND/day\nInclusions: Helmet\nDeposit: No Deposit required\nPayment Method: Cash, Bank Transfer`
    }
  ],
  car_driver: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
      alt: 'Car Rental with Driver Demo 1',
      description: `Type: Car with Driver\nRental Duration: Half-day | Full-day | Multi-day\nPickup Location: Hotel or agency in Mui Ne\nRequired Documents: Passport\nPrice Range: 800,000 – 1,200,000 VND/day\nInclusions: Driver, Fuel, Insurance\nDeposit: No deposit required\nPayment Method: Cash, Bank Transfer`
    }
  ],
  car_self: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80',
      alt: 'Car Rental Self-drive Demo 1',
      description: `Type: Car without Driver\nRental Duration: Full-day | Multi-day\nPickup Location: Hotel or agency in Mui Ne\nRequired Documents: Passport, Driver's License (Int'l Preferred)\nPrice Range: 700,000 – 1,000,000 VND/day\nInclusions: Insurance, Unlimited km\nDeposit: 2,000,000 VND + Passport\nPayment Method: Cash, Bank Transfer`
    }
  ],
  // ================ CURRENCY EXCHANGE ================
  usd: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
      alt: 'USD Exchange Demo 1',
      description: `Currency: USD\nRate Info: 25,600 Vnd/Usd\nProviders: SCB Bank, Hotels, Mui Ne Adventure\nAccepted Notes: $10 and above, no damage\nPayment Method: Cash only`
    }
  ],
  eur: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
      alt: 'EUR Exchange Demo 1',
      description: `Currency: EUR\nRate Info: May be limited\nProviders: Hotels, Travel Desks\nAccepted Notes: New notes only\nPayment Method: Cash only`
    }
  ],
  currency_other: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80',
      alt: 'Other Currency Exchange Demo 1',
      description: `Currency: Others (GBP, JPY, KRW, RUB)\nRate Info: Availability limited\nProviders: Hotel reception, Mui Ne Adventure\nAccepted Notes: Clean, undamaged bills\nPayment Method: Cash only`
    }
  ],
  // ================ LAUNDRY SERVICE ================
  laundry_regular: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
      alt: 'Regular Laundry Demo 1',
      description: `Type: Regular Wash\nTurnaround Time: 24h\nPrice: 30,000 VND/kg\nExtras: Ironing optional\nPayment Method: Cash, Hotel bill`
    }
  ],
  laundry_express: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
      alt: 'Express Laundry Demo 1',
      description: `Type: Express Wash\nTurnaround Time: 4–6h\nPrice: 40,000 – 50,000 VND/kg\nExtras: Quick return, Eco detergent\nPayment Method: Cash`
    }
  ],
  laundry_special: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      alt: 'Delicates Laundry Demo 1',
      description: `Type: Delicates & Special Garments\nTurnaround Time: Next-day\nPrice: 15,000 – 60,000 VND/item\nExtras: Hand wash, Low heat drying\nPayment Method: Cash`
    }
  ],
  // ================ HOMESTAY ================
  homestay_300k: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80',
      alt: 'Homestay <300k Demo 1',
      description: `Price Range: Under 300,000 VND\nRoom Type: Fan Room, Shared Dorm\nAmenities: WiFi, Fan, Shared Bathroom\nLocation: Backpacker zone, alleys\nBooking Method: Direct, WhatsApp`
    }
  ],
  homestay_300_600k: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
      alt: 'Homestay 300-600k Demo 1',
      description: `Price Range: 300,000 – 600,000 VND\nRoom Type: Private Room\nAmenities: WiFi, A/C, Private Bathroom\nLocation: Near beach, tourist area\nBooking Method: Hotel desk, Online`
    }
  ],
  homestay_600k: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80',
      alt: 'Homestay >600k Demo 1',
      description: `Price Range: Over 600,000 VND\nRoom Type: Deluxe, Family Room\nAmenities: A/C, Breakfast, View\nLocation: Beachfront or mid-range\nBooking Method: Online booking`
    }
  ],
  // ================ TOURS ================
  tour_halfday: [
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_1.jpg',
      alt: 'White Sand Dunes 1',
      description: 'Tour Name: East Of Mui Ne\nDestination: White Sand Dunes\nTime: 04:30 - 06:00\nActivity: Sunrise Jeep Tour\nGuide: Mr. A'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_2.jpg',
      alt: 'Tour Half Day 2',
      description: 'Tour Name: East Of Mui Ne\nDestination: Red Sand Dunes\nTime: 06:15 - 07:00\nActivity: Sand Sliding\nGuide: Mr. B'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_3.jpg',
      alt: 'Tour Half Day 3',
      description: 'Tour Name: East Of Mui Ne\nDestination: Fairy Stream\nTime: 07:15 - 08:00\nActivity: Walking in the stream\nGuide: Ms. C'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_4.jpg',
      alt: 'Tour Half Day 4',
      description: 'Tour Name: East Of Mui Ne\nDestination: Fishing Village\nTime: 08:15 - 08:45\nActivity: Local Life Experience\nGuide: Mr. D'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_5.jpg',
      alt: 'Tour Half Day 5',
      description: 'Tour Name: East Of Mui Ne\nDestination: Mui Ne Beach\nTime: 09:00 - 09:30\nActivity: Relaxing\nGuide: Ms. E'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_6.jpg',
      alt: 'Tour Half Day 6',
      description: 'Tour Name: East Of Mui Ne\nDestination: Lotus Lake\nTime: 09:45 - 10:15\nActivity: Photo Stop\nGuide: Mr. F'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_7.jpg',
      alt: 'Tour Half Day 7',
      description: 'Tour Name: East Of Mui Ne\nDestination: Local Market\nTime: 10:30 - 11:00\nActivity: Shopping\nGuide: Ms. G'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_8.jpg',
      alt: 'Tour Half Day 8',
      description: 'Tour Name: East Of Mui Ne\nDestination: Dragon Fruit Farm\nTime: 11:15 - 11:45\nActivity: Farm Visit\nGuide: Mr. H'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_9.jpg',
      alt: 'Tour Half Day 9',
      description: 'Tour Name: East Of Mui Ne\nDestination: Cham Tower\nTime: 12:00 - 12:30\nActivity: Sightseeing\nGuide: Ms. I'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_10.jpg',
      alt: 'Tour Half Day 10',
      description: 'Tour Name: East Of Mui Ne\nDestination: Sand Sculpture Park\nTime: 12:45 - 13:15\nActivity: Art Visit\nGuide: Mr. J'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_11.jpg',
      alt: 'Tour Half Day 11',
      description: 'Tour Name: East Of Mui Ne\nDestination: Mui Ne Harbor\nTime: 13:30 - 14:00\nActivity: Boat Watching\nGuide: Ms. K'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_12.jpg',
      alt: 'Tour Half Day 12',
      description: 'Tour Name: East Of Mui Ne\nDestination: Local Pagoda\nTime: 14:15 - 14:45\nActivity: Cultural Visit\nGuide: Mr. L'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_13.jpg',
      alt: 'Tour Half Day 13',
      description: 'Tour Name: East Of Mui Ne\nDestination: Sunset Point\nTime: 15:00 - 15:30\nActivity: Sunset Watching\nGuide: Ms. M'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/Fairy_Stream2.jpg',
      alt: 'Fairy Stream 2',
      description: 'Tour Name: East Of Mui Ne\nDestination: Fairy Stream\nTime: 07:15 - 08:00\nActivity: Walking in the stream\nGuide: Ms. C'
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/Fairy_Stream1.png',
      alt: 'Fairy Stream 1',
      description: 'Tour Name: East Of Mui Ne\nDestination: Fairy Stream\nTime: 07:15 - 08:00\nActivity: Walking in the stream\nGuide: Ms. C'
    }
  ],
  tour_fullday: [
    {
      type: 'image',
      src: '/assets/tour_fullday/PoSahInu_Tower1.jpg',
      alt: 'Po Sah Inu Tower 1',
      description: 'Tour Name: East Of Mui Ne\nAttraction: Po Sah Inu Tower\nLocation: Phan Thiet\nHighlight: Cham architecture\nActivity: Sightseeing'
    },
    {
      type: 'image',
      src: '/assets/tour_fullday/PoSahInu_Tower2.jpg',
      alt: 'Po Sah Inu Tower 2',
      description: 'Tour Name: East Of Mui Ne\nAttraction: Po Sah Inu Tower\nLocation: Phan Thiet\nHighlight: Cham architecture\nActivity: Sightseeing'
    },
    {
      type: 'image',
      src: '/assets/tour_fullday/dragon fruit plantation.jpeg',
      alt: 'Dragon Fruit Plantation',
      description: 'Tour Name: East Of Mui Ne\nAttraction: Dragon Fruit Plantation\nActivity: Farm Visit\nHighlight: Local agriculture'
    },
    {
      type: 'image',
      src: '/assets/tour_fullday/Ke ga lighthouse.jpg',
      alt: 'Ke Ga Lighthouse',
      description: 'Tour Name: East Of Mui Ne\nAttraction: Ke Ga Lighthouse\nLocation: Ke Ga Cape\nHighlight: Oldest lighthouse in Vietnam\nActivity: Sightseeing'
    },
    {
      type: 'image',
      src: '/assets/tour_fullday/KeGa_Lighthouse1.jpg',
      alt: 'Ke Ga Lighthouse 1',
      description: 'Tour Name: East Of Mui Ne\nAttraction: Ke Ga Lighthouse\nLocation: Ke Ga Cape\nHighlight: Oldest lighthouse in Vietnam\nActivity: Sightseeing'
    },
    {
      type: 'image',
      src: '/assets/tour_fullday/Wine_Castle2.jpg',
      alt: 'Wine Castle 2',
      description: 'Tour Name: East Of Mui Ne\nAttraction: Wine Castle\nLocation: Mui Ne\nHighlight: Wine tasting, European architecture\nActivity: Visit & Tasting'
    }
  ],
  tour_multiday: [
    {
      type: 'image',
      src: '/assets/tour_multiday/Tuyen_Lam_Lake_Dalat.jpg',
      alt: 'Tuyen Lam Lake Dalat',
      description: 'Tour Name: East Of Mui Ne\nAttraction: Tuyen Lam Lake\nLocation: Da Lat\nHighlight: Scenic lake, boat ride\nActivity: Sightseeing'
    },
    {
      type: 'image',
      src: '/assets/tour_multiday/Langbiang-dalat-2.jpg',
      alt: 'Langbiang Dalat 2',
      description: 'Tour Name: East Of Mui Ne\nAttraction: Langbiang Mountain\nLocation: Da Lat\nHighlight: Trekking, panoramic view\nActivity: Hiking'
    },
    {
      type: 'image',
      src: '/assets/tour_multiday/Prenn_Waterfall_tour1.jpg',
      alt: 'Prenn Waterfall Tour 1',
      description: 'Tour Name: East Of Mui Ne\nAttraction: Prenn Waterfall\nLocation: Da Lat\nHighlight: Waterfall, elephant ride\nActivity: Sightseeing'
    },
    {
      type: 'image',
      src: '/assets/tour_multiday/flower-garden-dalat.jpg',
      alt: 'Flower Garden Dalat',
      description: 'Tour Name: East Of Mui Ne\nAttraction: Flower Garden\nLocation: Da Lat\nHighlight: Colorful flowers, photography\nActivity: Visit & Photo'
    }
  ],
  special_tour: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80',
      alt: 'Special Tour Demo 1',
      description: `Tour: Hot Air Balloon Ride\nDuration: ~30 min flight + transfer\nPickup: Hotel in early morning\nInclusions: Balloon Ride, Transport, Drink\nPrice: 3,800,000 VND/person\nLanguage: English, Vietnamese`
    }
  ]
}; 