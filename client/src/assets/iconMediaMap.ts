// iconMediaMap.ts
// Ánh xạ tên icon sang media động tương ứng (ảnh, video, gif...)
// Bạn chỉ cần bổ sung file media vào thư mục /assets/icon-media/ và cập nhật object này

export type IconMediaType = 'image' | 'video' | 'gif';

export interface IconMedia {
  type: IconMediaType;
  src: string; // Đường dẫn tới file media
  alt?: string;
}

export const iconMediaMap: Record<string, IconMedia> = {
  login: { type: 'gif', src: '', alt: 'Login Animation' },
  hourglass_empty: { type: 'video', src: '', alt: 'Hourglass Video' },
  info: { type: 'gif', src: '', alt: 'Info Animation' },
  policy: { type: 'image', src: '', alt: 'Policy' },
  wifi: { type: 'image', src: '', alt: 'Wifi' },
  restaurant: { type: 'image', src: '', alt: 'Restaurant' },
  local_bar: { type: 'image', src: '', alt: 'Bar' },
  cleaning_services: { type: 'image', src: '', alt: 'Cleaning Services' },
  local_laundry_service: { type: 'image', src: '', alt: 'Laundry Service' },
  alarm: { type: 'gif', src: '', alt: 'Alarm' },
  add_circle: { type: 'image', src: '', alt: 'Add Circle' },
  build: { type: 'image', src: '', alt: 'Build' },
  event_seat: { type: 'image', src: '', alt: 'Event Seat' },
  spa: { type: 'image', src: '', alt: 'Spa' },
  fitness_center: { type: 'image', src: '', alt: 'Fitness Center' },
  pool: { type: 'image', src: '', alt: 'Pool' },
  directions_car: { type: 'image', src: '', alt: 'Car' },
  medical_services: { type: 'image', src: '', alt: 'Medical Services' },
  support_agent: { type: 'image', src: '', alt: 'Support Agent' },
  location_on: { type: 'image', src: '', alt: 'Location' },
  local_dining: { type: 'image', src: '', alt: 'Dining' },
  directions_bus: { type: 'image', src: '', alt: 'Bus' },
  event: { type: 'image', src: '', alt: 'Event' },
  shopping_bag: { type: 'image', src: '', alt: 'Shopping Bag' },
  map: { type: 'image', src: '', alt: 'Map' },
  translate: { type: 'image', src: '', alt: 'Translate' },
  rate_review: { type: 'image', src: '', alt: 'Rate Review' },
  report_problem: { type: 'image', src: '', alt: 'Report Problem' },
  luggage: { type: 'image', src: '', alt: 'Luggage' },
}; 