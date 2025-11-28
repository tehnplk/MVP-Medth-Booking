
import { Service, Staff, TimeSlot, ShopConfig, StaffSchedule } from './types';

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
    id: 's01',
    name: 'คุณสมศรี',
    role: 'Senior Therapist',
    specialty: ['thai-traditional', 'foot-massage'],
    image: 'https://picsum.photos/100/100?random=10'
  },
  {
    id: 's02',
    name: 'คุณวิชัย',
    role: 'Therapist',
    specialty: ['thai-traditional', 'office-syndrome'],
    image: 'https://picsum.photos/100/100?random=11'
  },
  {
    id: 's03',
    name: 'คุณแอนนา',
    role: 'Aroma Specialist',
    specialty: ['aroma-oil', 'office-syndrome'],
    image: 'https://picsum.photos/100/100?random=12'
  },
  {
    id: 's04',
    name: 'คุณนภา',
    role: 'Master Therapist',
    specialty: ['thai-traditional', 'aroma-oil', 'foot-massage', 'office-syndrome'],
    image: 'https://picsum.photos/100/100?random=13'
  }
];

// 1. SHOP CONFIGURATION
// Helper to get a date string for "tomorrow" or X days from now for demo purposes
const getFutureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const SHOP_CONFIG: ShopConfig = {
  openTime: 10, // 10:00 AM
  closeTime: 20, // 8:00 PM
  holidays: [
    getFutureDate(3), // Shop closed 3 days from now
    getFutureDate(7)  // Shop closed 7 days from now
  ],
  slotInterval: 30 // Duration of each time slot in minutes
};

// 2. STAFF AVAILABILITY SCHEDULES
export const STAFF_SCHEDULES: Record<string, StaffSchedule> = {
  's01': {
    staffId: 's01',
    offDays: [getFutureDate(1)], // Off tomorrow
    busySlots: {
      [getFutureDate(0)]: ['10:00', '10:30', '14:00'] // Busy today at specific times
    }
  },
  's02': {
    staffId: 's02',
    offDays: [getFutureDate(2)],
    busySlots: {}
  },
  's03': {
    staffId: 's03',
    offDays: [],
    busySlots: {
      [getFutureDate(0)]: ['13:00', '13:30']
    }
  },
  's04': {
    staffId: 's04',
    offDays: [],
    busySlots: {}
  }
};

export const GENERATE_TIME_SLOTS = (config: ShopConfig): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const { openTime, closeTime, slotInterval } = config;
  
  const startTimeInMinutes = openTime * 60;
  const endTimeInMinutes = closeTime * 60;

  for (let time = startTimeInMinutes; time < endTimeInMinutes; time += slotInterval) {
    const h = Math.floor(time / 60);
    const m = time % 60;
    const timeString = `${h}:${m.toString().padStart(2, '0')}`;
    
    slots.push({ 
      id: timeString, 
      time: timeString, 
      available: true 
    });
  }
  return slots;
};
