import { Service, Staff, TimeSlot, ShopConfig, StaffSchedule, Branch, BookingHistory } from './types';

export const BRANCHES: Branch[] = [
  {
    id: 'b-siam',
    name: 'สาขาสยามพารากอน',
    location: 'ชั้น 3 ฝั่ง North โซน Beauty',
    image: 'https://images.unsplash.com/photo-1590073242678-cfe2f792f3c8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'b-central',
    name: 'สาขาเซ็นทรัลเวิลด์',
    location: 'ชั้น 2 โซน Dazzle',
    image: 'https://images.unsplash.com/photo-1565060169194-1372607d8804?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'b-thonglor',
    name: 'สาขาทองหล่อ',
    location: 'สุขุมวิท 55 (ทองหล่อ 13)',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80'
  }
];

export const SERVICES: Service[] = [
  {
    id: 'thai-traditional',
    name: 'นวดแผนไทย',
    description: 'การนวดกดจุดและยืดเหยียดกล้ามเนื้อ เพื่อผ่อนคลายความตึงเครียดและปรับสมดุลร่างกาย',
    duration: 60,
    price: 500,
    image: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 'aroma-oil',
    name: 'นวดน้ำมันอโรมา',
    description: 'นวดผ่อนคลายด้วยน้ำมันหอมระเหย ช่วยกระตุ้นการไหลเวียนโลหิตและบำรุงผิวพรรณ',
    duration: 90,
    price: 1200,
    image: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 'foot-massage',
    name: 'นวดฝ่าเท้า',
    description: 'กระตุ้นจุดสะท้อนที่ฝ่าเท้า เพื่อส่งเสริมการทำงานของอวัยวะต่างๆ ภายในร่างกาย',
    duration: 60,
    price: 450,
    image: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: 'office-syndrome',
    name: 'นวดแก้ออฟฟิศซินโดรม',
    description: 'เน้นเฉพาะจุด คอ บ่า ไหล่ เพื่อบรรเทาอาการปวดเมื่อยจากการนั่งทำงานนานๆ',
    duration: 60,
    price: 600,
    image: 'https://picsum.photos/400/300?random=4'
  }
];

export const STAFF_MEMBERS: Staff[] = [
  {
    id: 's-somchai',
    name: 'หมอสมชาย',
    role: 'ผู้เชี่ยวชาญการนวดไทย',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    specialty: ['thai-traditional', 'foot-massage']
  },
  {
    id: 's-anna',
    name: 'หมอแอนนา',
    role: 'ผู้เชี่ยวชาญอโรมา',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    specialty: ['aroma-oil', 'office-syndrome']
  },
  {
    id: 's-lek',
    name: 'หมอเล็ก',
    role: 'หมอนวดอาวุโส',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    specialty: ['thai-traditional', 'office-syndrome', 'foot-massage']
  },
  {
    id: 's-keng',
    name: 'หมอเก่ง',
    role: 'นักกายภาพบำบัด',
    image: 'https://randomuser.me/api/portraits/men/85.jpg',
    specialty: ['office-syndrome', 'thai-traditional']
  }
];

export const SHOP_CONFIG: ShopConfig = {
  openTime: 10,
  closeTime: 20,
  holidays: ['2025-12-05', '2025-12-31'],
  slotInterval: 60 // 60 minutes
};

export const STAFF_SCHEDULES: { [key: string]: StaffSchedule } = {
  's-somchai': {
    staffId: 's-somchai',
    offDays: ['2025-12-06'],
    busySlots: {
      '2025-12-09': ['10:00', '14:00']
    }
  },
  's-anna': {
    staffId: 's-anna',
    offDays: ['2025-12-07'],
    busySlots: {}
  }
};

export const GENERATE_TIME_SLOTS = (config: ShopConfig): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = config.openTime;
  const endHour = config.closeTime;
  const interval = config.slotInterval;

  // Convert hours to minutes for easier calculation
  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    
    // Format "HH:mm"
    const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
    slots.push({
      id: `t-${timeString}`,
      time: timeString,
      available: true // Default to true, will be filtered by staff availability later
    });

    currentMinutes += interval;
  }

  return slots;
};

export const MOCK_BOOKING_HISTORY: BookingHistory[] = [
  {
    id: 'SS-251201-1234',
    branchName: 'สาขาสยามพารากอน',
    serviceName: 'นวดแผนไทย',
    date: '2025-12-01T00:00:00.000Z',
    time: '14:00',
    staffName: 'หมอสมชาย',
    customerPhone: '0812345678',
    status: 'completed'
  },
  {
    id: 'SS-251215-5678',
    branchName: 'สาขาทองหล่อ',
    serviceName: 'นวดน้ำมันอโรมา',
    date: '2025-12-15T00:00:00.000Z',
    time: '10:00',
    staffName: 'หมอแอนนา',
    customerPhone: '0812345678',
    status: 'confirmed'
  },
  {
    id: 'SS-251220-9999',
    branchName: 'สาขาเซ็นทรัลเวิลด์',
    serviceName: 'นวดแก้ออฟฟิศซินโดรม',
    date: '2025-12-20T00:00:00.000Z',
    time: '16:00',
    staffName: 'หมอเก่ง',
    customerPhone: '0900000000',
    status: 'confirmed'
  }
];