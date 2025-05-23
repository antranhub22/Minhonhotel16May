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
      alt: 'Tour Half Day 1',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_2.jpg',
      alt: 'Tour Half Day 2',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_3.jpg',
      alt: 'Tour Half Day 3',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_4.jpg',
      alt: 'Tour Half Day 4',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_5.jpg',
      alt: 'Tour Half Day 5',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_6.jpg',
      alt: 'Tour Half Day 6',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_7.jpg',
      alt: 'Tour Half Day 7',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_8.jpg',
      alt: 'Tour Half Day 8',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_9.jpg',
      alt: 'Tour Half Day 9',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_10.jpg',
      alt: 'Tour Half Day 10',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_11.jpg',
      alt: 'Tour Half Day 11',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_12.jpg',
      alt: 'Tour Half Day 12',
      description: ''
    },
    {
      type: 'image',
      src: '/assets/tour_halfday/tour_halfday_13.jpg',
      alt: 'Tour Half Day 13',
      description: ''
    }
  ],
  tour_fullday: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      alt: 'Tour Full Day Demo 1',
      description: `Tour: East Of Mui Ne\nDuration: Full-day\nPickup: Hotel\nItinerary: Tà Cú Pagoda, Cable Car, Poshanu Cham Towers\nInclusions: Transport, Tickets, Guide\nPrice: ~850,000 VND/person`
    }
  ],
  tour_multiday: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=600&q=80',
      alt: 'Tour Multi Day Demo 1',
      description: `Tour: Mui Ne – Da Lat 2D1N\nItinerary: Prenn waterfall, Langbiang, Tuyen Lam Lake, Flower Garden\nInclusions: Hotel, Meals, Entrance Fees, Guide\nPrice: ~2,500,000 – 3,000,000 VND/person\nLanguage: Vietnamese, English`
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