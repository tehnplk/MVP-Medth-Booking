import { Service, Staff, TimeSlot } from './types';

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

export const GENERATE_TIME_SLOTS = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 10;
  const endHour = 20;

  for (let i = startHour; i < endHour; i++) {
    slots.push({ id: `${i}:00`, time: `${i}:00`, available: Math.random() > 0.3 });
    slots.push({ id: `${i}:30`, time: `${i}:30`, available: Math.random() > 0.3 });
  }
  return slots;
};
