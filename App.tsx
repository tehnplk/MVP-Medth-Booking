
import React, { useState, useEffect } from 'react';
import { BookingStep, BookingState, Service, TimeSlot, Staff, Branch, BookingHistory } from './types';
import { SERVICES, STAFF_MEMBERS, GENERATE_TIME_SLOTS, SHOP_CONFIG, STAFF_SCHEDULES, BRANCHES, MOCK_BOOKING_HISTORY } from './constants';
import { StepIndicator } from './components/StepIndicator';
import { Button } from './components/Button';
import { getServiceRecommendation } from './services/geminiService';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Phone,
  AlertCircle,
  XCircle,
  MapPin,
  Store,
  QrCode,
  Search,
  Ticket
} from 'lucide-react';

// --- Helper Functions ---

const formatThaiDate = (date: Date) => {
  const day = date.getDate();
  const month = new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(date);
  const year = (date.getFullYear() + 543).toString().slice(-2);
  return `${day} ${month} ${year}`;
};

const formatThaiDateShort = (date: Date) => {
  const day = date.getDate();
  const month = new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(date);
  // No year as requested
  return `${day} ${month}`;
};

const formatThaiDateString = (isoDate: string) => {
  const date = new Date(isoDate);
  return formatThaiDate(date);
};

const toISODateString = (date: Date) => {
  // Use local time for date string to avoid timezone shifts
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

const formatPhoneNumber = (value: string) => {
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  }
  return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

// --- Sub-components ---

// 0. Branch Selection Component
const BranchSelection = ({ 
  onSelect,
  onCheckHistory
}: { 
  onSelect: (b: Branch) => void,
  onCheckHistory: () => void
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* 1. Search Section - Top Priority */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200">
         <h2 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
           <Search size={22} className="text-primary-600"/> 
           มีรายการจองอยู่แล้ว?
         </h2>
         <Button 
          variant="outline" 
          fullWidth 
          onClick={onCheckHistory}
          className="!py-3 !text-lg !rounded-xl border-2 border-stone-200 text-stone-600 hover:border-primary-500 hover:text-primary-700 bg-stone-50"
        >
          ตรวจสอบสถานะ / ค้นหาตั๋ว
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-primary-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-primary-50 text-sm text-stone-400 font-medium">หรือ จองคิวใหม่</span>
        </div>
      </div>

      {/* 2. Branch Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-100 p-3 rounded-full text-primary-600">
            <Store size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">เลือกสาขา</h2>
            <p className="text-base text-stone-500">เลือกสาขาที่ใกล้คุณที่สุดค่ะ</p>
          </div>
        </div>

        <div className="space-y-4">
          {BRANCHES.map((branch) => (
            <div 
              key={branch.id}
              onClick={() => onSelect(branch)}
              className="group relative flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-3xl border-2 border-stone-200 bg-white hover:border-primary-300 hover:bg-white transition-all cursor-pointer active:scale-[0.98] touch-manipulation shadow-sm"
            >
              <img src={branch.image} alt={branch.name} className="w-full sm:w-28 h-40 sm:h-28 rounded-2xl object-cover shadow-md mb-4 sm:mb-0" />
              
              <div className="sm:ml-5 flex-1 w-full">
                <h3 className="text-xl font-bold text-stone-900 leading-tight mb-2 group-hover:text-primary-700 transition-colors">{branch.name}</h3>
                <div className="flex items-start gap-2 text-stone-500 text-base leading-relaxed">
                  <MapPin size={18} className="mt-1 shrink-0 text-primary-500" />
                  <span>{branch.location}</span>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto sm:ml-4 bg-primary-100 text-primary-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={24} className="rotate-180" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 1. Service Selection Component
const ServiceSelection = ({ 
  onSelect, 
  recommendedId 
}: { 
  onSelect: (s: Service) => void, 
  recommendedId?: string 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiResult, setAiResult] = useState<{id: string, reason: string} | null>(null);

  const handleAskAI = async () => {
    if (!prompt.trim()) return;
    setIsThinking(true);
    const result = await getServiceRecommendation(prompt);
    setIsThinking(false);
    if (result) {
      setAiResult({ id: result.recommendedServiceId, reason: result.reasoning });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* AI Section - Slightly larger text */}
      <div className="bg-gradient-to-br from-white to-primary-50 p-6 rounded-3xl border border-primary-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-primary-100 p-3 rounded-2xl text-primary-600 mt-1">
            <Sparkles size={28} />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-bold text-primary-900">ให้ AI ช่วยแนะนำ?</h3>
              <p className="text-base text-stone-600 mt-1">บอกอาการปวดเมื่อยของคุณ เดี๋ยวระบบช่วยเลือกให้ค่ะ</p>
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="เช่น ปวดหลัง, ปวดขา..."
                className="flex-1 px-4 py-3 text-lg border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary-400 outline-none shadow-sm"
              />
              <Button 
                onClick={handleAskAI} 
                disabled={isThinking || !prompt}
                className="!py-3 !px-6 !rounded-xl text-lg font-medium"
              >
                {isThinking ? <Loader2 className="animate-spin" size={24} /> : 'ค้นหา'}
              </Button>
            </div>
            {aiResult && (
              <div className="mt-4 bg-white p-4 rounded-xl border-l-4 border-primary-500 shadow-sm">
                <p className="text-lg text-stone-800">
                  <span className="font-bold text-primary-700 block mb-1">แนะนำ:</span> 
                  {aiResult.reason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services List - Large Cards */}
      <div className="space-y-4">
        {SERVICES.map((service) => {
          const isRecommended = aiResult?.id === service.id;
          return (
            <div 
              key={service.id}
              onClick={() => onSelect(service)}
              className={`
                relative flex items-center p-5 rounded-3xl border-2 transition-all cursor-pointer shadow-sm
                active:scale-[0.98] touch-manipulation
                ${isRecommended ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-stone-200 bg-white hover:border-primary-300'}
              `}
            >
              {isRecommended && (
                <div className="absolute -top-4 right-6 bg-primary-600 text-white text-sm px-4 py-1.5 rounded-full font-bold shadow-md flex items-center gap-1">
                  <Sparkles size={14} /> แนะนำสำหรับคุณ
                </div>
              )}
              
              <img src={service.image} alt={service.name} className="w-24 h-24 rounded-2xl object-cover shadow-md" />
              
              <div className="ml-5 flex-1 min-w-0">
                <h3 className="text-xl font-bold text-stone-900 leading-tight mb-2">{service.name}</h3>
                <p className="text-base text-stone-500 line-clamp-2 leading-relaxed mb-3">{service.description}</p>
                <div className="flex items-center gap-3">
                  <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-lg text-base font-bold">
                    {service.price} บ.
                  </span>
                  <span className="text-stone-500 text-base flex items-center gap-1">
                    <Clock size={16} /> {service.duration} นาที
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. Date Selection Component
const DateSelection = ({ 
  selectedDate, 
  onSelect 
}: { 
  selectedDate: Date | null, 
  onSelect: (d: Date) => void 
}) => {
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    setDates(arr);
  }, []);

  const getDayName = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', { weekday: 'long' }).format(date);
  };

  const isHoliday = (date: Date) => {
    const dateString = toISODateString(date);
    return SHOP_CONFIG.holidays.includes(dateString);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary-100 p-3 rounded-full text-primary-600">
          <Calendar size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">เลือกวันที่</h2>
          {SHOP_CONFIG.holidays.length > 0 && (
            <p className="text-sm text-red-500 mt-1">* สีเทาคือวันหยุดร้าน</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {dates.map((date, idx) => {
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const holiday = isHoliday(date);
          
          return (
            <button
              key={idx}
              onClick={() => !holiday && onSelect(date)}
              disabled={holiday}
              className={`
                flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all
                touch-manipulation shadow-sm relative overflow-hidden
                ${holiday 
                  ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed' 
                  : isSelected 
                    ? 'border-primary-500 bg-primary-600 text-white ring-2 ring-primary-300 ring-offset-2 active:scale-95' 
                    : 'border-stone-200 bg-white text-stone-600 hover:border-primary-300 hover:bg-stone-50 active:scale-95'}
              `}
            >
              <span className={`text-lg font-medium mb-1 ${isSelected ? 'text-primary-100' : 'text-stone-500'}`}>
                {getDayName(date)}
              </span>
              <span className={`text-2xl font-bold ${holiday ? 'line-through text-stone-400' : ''}`}>
                {formatThaiDateShort(date)}
              </span>
              {holiday && (
                <div className="absolute top-2 right-2 text-red-400">
                  <XCircle size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 3. Time Selection Component
const TimeSelection = ({ 
  selectedTime, 
  onSelect 
}: { 
  selectedTime: TimeSlot | null, 
  onSelect: (t: TimeSlot) => void 
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    // Generate slots based on Shop Config
    setSlots(GENERATE_TIME_SLOTS(SHOP_CONFIG));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary-100 p-3 rounded-full text-primary-600">
          <Clock size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">เลือกเวลา</h2>
          <p className="text-base text-stone-500">
            ร้านเปิด {SHOP_CONFIG.openTime}:00 - {SHOP_CONFIG.closeTime}:00 น.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {slots.map((slot) => {
          const isSelected = selectedTime?.id === slot.id;
          return (
            <button
              key={slot.id}
              disabled={!slot.available}
              onClick={() => onSelect(slot)}
              className={`
                py-5 rounded-2xl border-2 font-bold text-xl transition-all relative overflow-hidden touch-manipulation
                ${!slot.available 
                  ? 'bg-stone-100 text-stone-300 border-stone-100 cursor-not-allowed' 
                  : isSelected 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg scale-105 ring-2 ring-primary-300 ring-offset-1' 
                    : 'bg-white text-stone-700 border-stone-200 hover:border-primary-400 hover:bg-stone-50'}
              `}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 4. Staff Selection Component
const StaffSelection = ({ 
  serviceId,
  selectedStaff, 
  date,
  timeSlot,
  onSelect 
}: { 
  serviceId: string,
  selectedStaff: Staff | null, 
  date: Date,
  timeSlot: TimeSlot,
  onSelect: (s: Staff) => void 
}) => {
  const availableStaff = STAFF_MEMBERS.filter(s => s.specialty.includes(serviceId));

  const checkAvailability = (staffId: string) => {
    const schedule = STAFF_SCHEDULES[staffId];
    if (!schedule) return { available: true, reason: '' }; // No specific schedule means available

    const dateStr = toISODateString(date);

    // Check Day Off
    if (schedule.offDays.includes(dateStr)) {
      return { available: false, reason: 'วันหยุด' };
    }

    // Check Busy Time
    const busyTimes = schedule.busySlots[dateStr];
    if (busyTimes && busyTimes.includes(timeSlot.time)) {
      return { available: false, reason: 'ไม่ว่าง' };
    }

    return { available: true, reason: '' };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary-100 p-3 rounded-full text-primary-600">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">เลือกพนักงาน</h2>
          <p className="text-base text-stone-500">เลือกคนที่คุณถูกใจได้เลยค่ะ</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {availableStaff.map((staff) => {
          const isSelected = selectedStaff?.id === staff.id;
          const { available, reason } = checkAvailability(staff.id);

          return (
            <button
              key={staff.id}
              onClick={() => available && onSelect(staff)}
              disabled={!available}
              className={`
                w-full flex items-center p-5 rounded-3xl border-2 transition-all touch-manipulation text-left
                ${!available 
                  ? 'bg-stone-50 border-stone-100 opacity-60 cursor-not-allowed' 
                  : isSelected 
                    ? 'border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-500 active:scale-[0.98]' 
                    : 'border-stone-200 bg-white hover:border-primary-300 active:scale-[0.98]'}
              `}
            >
              <div className="relative">
                <img 
                  src={staff.image} 
                  alt={staff.name} 
                  className={`w-24 h-24 rounded-full object-cover border-4 shadow-sm ${!available ? 'grayscale border-stone-200' : 'border-white'}`} 
                />
                {!available && (
                   <div className="absolute inset-0 bg-stone-100/50 rounded-full flex items-center justify-center">
                     <span className="text-xs font-bold bg-stone-600 text-white px-2 py-0.5 rounded-full">{reason}</span>
                   </div>
                )}
              </div>
              
              <div className="ml-5 flex-1">
                <h3 className={`text-xl font-bold mb-1 ${isSelected ? 'text-primary-900' : 'text-stone-800'}`}>{staff.name}</h3>
                <p className="text-base text-stone-500">{staff.role}</p>
              </div>
              
              {isSelected && (
                <div className="mr-2 text-primary-600">
                  <CheckCircle2 size={32} className="fill-current text-white bg-primary-600 rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 5. Confirmation Component
const Confirmation = ({ 
  bookingState, 
  onConfirm,
  onChange 
}: { 
  bookingState: BookingState, 
  onConfirm: () => void,
  onChange: (field: string, value: string) => void
}) => {
  const [isValidPhone, setIsValidPhone] = useState(true);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 10 digits
    const truncated = rawValue.slice(0, 10);
    
    onChange('customerPhone', truncated);

    // Validate: Must be 10 digits and start with 06, 08, 09
    const regex = /^0[689]\d{8}$/;
    setIsValidPhone(regex.test(truncated) || truncated.length === 0);
  };

  const formattedPhone = formatPhoneNumber(bookingState.customerPhone);
  const canSubmit = bookingState.customerName.trim().length > 0 && 
                    bookingState.customerPhone.length === 10 && isValidPhone;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary-100 p-3 rounded-full text-primary-600">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">ยืนยันการจอง</h2>
          <p className="text-base text-stone-500">ตรวจสอบข้อมูลก่อนยืนยันนะคะ</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex justify-between border-b border-stone-100 pb-3">
          <span className="text-stone-500">สาขา</span>
          <span className="font-bold text-stone-800 text-right">{bookingState.branch?.name}</span>
        </div>
        <div className="flex justify-between border-b border-stone-100 pb-3">
          <span className="text-stone-500">บริการ</span>
          <span className="font-bold text-stone-800">{bookingState.service?.name}</span>
        </div>
        <div className="flex justify-between border-b border-stone-100 pb-3">
          <span className="text-stone-500">วันที่</span>
          <span className="font-bold text-stone-800">
            {bookingState.date ? formatThaiDate(bookingState.date) : '-'}
          </span>
        </div>
        <div className="flex justify-between border-b border-stone-100 pb-3">
          <span className="text-stone-500">เวลา</span>
          <span className="font-bold text-stone-800">{bookingState.timeSlot?.time} น.</span>
        </div>
        <div className="flex justify-between border-b border-stone-100 pb-3">
          <span className="text-stone-500">พนักงาน</span>
          <span className="font-bold text-stone-800">{bookingState.staff?.name}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-stone-800">ราคา</span>
          <span className="text-2xl font-bold text-primary-600">{bookingState.service?.price} บาท</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-base font-medium text-stone-700 mb-2">ชื่อผู้จอง</label>
          <input
            type="text"
            value={bookingState.customerName}
            onChange={(e) => onChange('customerName', e.target.value)}
            className="w-full px-5 py-4 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-lg"
            placeholder="ระบุชื่อของคุณ"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-stone-700 mb-2">เบอร์โทรศัพท์ (มือถือ 10 หลัก)</label>
          <div className="relative">
             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
             <input
              type="tel"
              value={formattedPhone}
              onChange={handlePhoneChange}
              maxLength={12} // 10 digits + 2 hyphens
              className={`w-full pl-12 pr-5 py-4 rounded-xl border-2 outline-none text-lg tracking-wide font-mono ${!isValidPhone && bookingState.customerPhone.length > 0 ? 'border-red-500 focus:border-red-500 text-red-600' : 'border-stone-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'}`}
              placeholder="0xx-xxx-xxxx"
            />
          </div>
          {!isValidPhone && bookingState.customerPhone.length > 0 && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle size={16} /> กรุณากรอกเบอร์มือถือให้ถูกต้อง (เช่น 0812345678)
            </p>
          )}
        </div>
      </div>

      <Button 
        fullWidth 
        onClick={onConfirm} 
        disabled={!canSubmit}
        className="mt-4 !py-4 !text-xl !font-bold"
      >
        ยืนยันการจอง
      </Button>
    </div>
  );
};

// 6. Success Component (Ticket)
const SuccessScreen = ({ bookingId }: { bookingId: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in pb-10 px-2">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-stone-800">จองสำเร็จ!</h2>
        <p className="text-stone-500 mt-2 text-lg">ขอบคุณที่ใช้บริการค่ะ</p>
      </div>

      {/* Ticket UI */}
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-xl border border-stone-100 relative">
        {/* Ticket Header */}
        <div className="bg-primary-600 p-6 text-center">
           <h3 className="text-white text-xl font-bold">บัตรนัดรับบริการ</h3>
           <p className="text-primary-100 text-sm opacity-90">คลินิกแผนไทย วสส.พล</p>
        </div>
        
        {/* Ticket Body */}
        <div className="p-8 flex flex-col items-center gap-6">
           <div className="bg-white p-2 rounded-xl border-2 border-stone-100 shadow-inner">
             <img 
               src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bookingId}`} 
               alt="Booking QR" 
               className="w-48 h-48 object-contain"
             />
           </div>
           
           <div className="text-center space-y-1">
             <p className="text-stone-400 text-sm uppercase tracking-wider font-semibold">Booking ID</p>
             <p className="text-2xl font-mono font-bold text-stone-800 tracking-widest">{bookingId}</p>
           </div>
        </div>

        {/* Cutout Circles */}
        <div className="absolute top-[88px] -left-4 w-8 h-8 bg-primary-50 rounded-full"></div>
        <div className="absolute top-[88px] -right-4 w-8 h-8 bg-primary-50 rounded-full"></div>
        
        {/* Dashed Line */}
        <div className="absolute top-[102px] left-4 right-4 border-b-2 border-dashed border-primary-400/30"></div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 text-center border-t border-stone-100">
          <p className="text-stone-500 text-sm flex items-center justify-center gap-2">
            <QrCode size={16}/> โปรดยื่น QR Code นี้ที่หน้าเคาน์เตอร์
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Button variant="ghost" onClick={() => window.location.reload()}>
          กลับสู่หน้าหลัก
        </Button>
      </div>
    </div>
  );
};

// 7. My Bookings Screen
const MyBookingsScreen = ({ onBack }: { onBack: () => void }) => {
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<BookingHistory[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingHistory | null>(null);

  const handleSearch = () => {
    if (phone.length < 10) return;
    setSearched(true);
    // Remove hyphens for search
    const cleanPhone = phone.replace(/-/g, '');
    const found = MOCK_BOOKING_HISTORY.filter(b => b.customerPhone === cleanPhone);
    setResults(found);
    setSelectedBooking(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const truncated = raw.slice(0, 10);
    setPhone(formatPhoneNumber(truncated));
    setSearched(false); 
  };

  // If a booking is selected, show ticket view
  if (selectedBooking) {
    return (
      <div className="animate-fade-in">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => setSelectedBooking(null)} className="pl-0">
             <ChevronLeft size={20} className="mr-1"/> กลับไปรายการ
          </Button>
        </div>
        <SuccessScreen bookingId={selectedBooking.id} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary-100 p-3 rounded-full text-primary-600">
          <Ticket size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">การจองของฉัน</h2>
          <p className="text-base text-stone-500">กรอกเบอร์โทรศัพท์เพื่อค้นหา</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 space-y-4">
        <div>
          <label className="block text-base font-medium text-stone-700 mb-2">เบอร์โทรศัพท์</label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="0xx-xxx-xxxx"
              className="flex-1 px-5 py-3 rounded-xl border-2 border-stone-200 focus:border-primary-500 outline-none text-lg font-mono tracking-wide"
            />
            <Button onClick={handleSearch} disabled={phone.replace(/\D/g,'').length !== 10}>
              <Search size={24} />
            </Button>
          </div>
        </div>
      </div>

      {searched && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-stone-700 px-2">
            {results.length > 0 ? 'รายการจองของคุณ' : 'ไม่พบข้อมูลการจอง'}
          </h3>
          
          {results.map(booking => (
            <div 
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex justify-between items-center hover:border-primary-400 cursor-pointer active:scale-98 transition-all relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-500"></div>
              <div>
                <div className="text-primary-700 font-bold mb-1">{booking.serviceName}</div>
                <div className="text-stone-500 text-sm flex items-center gap-2">
                  <Calendar size={14}/> {formatThaiDateString(booking.date)}
                </div>
                <div className="text-stone-500 text-sm flex items-center gap-2">
                   <Clock size={14}/> {booking.time} น.
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block ${
                  booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-500'
                }`}>
                  {booking.status === 'completed' ? 'ใช้บริการแล้ว' : 'ยืนยันแล้ว'}
                </div>
                <div className="text-stone-300 group-hover:text-primary-500 transition-colors">
                  <ChevronLeft size={20} className="rotate-180" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// --- Main App Component ---

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.BRANCH_SELECTION);
  const [bookingState, setBookingState] = useState<BookingState>({
    branch: null,
    service: null,
    date: null,
    timeSlot: null,
    staff: null,
    customerName: '',
    customerPhone: ''
  });
  const [bookingId, setBookingId] = useState<string>('');

  const handleStepComplete = (nextStep: BookingStep) => {
    setCurrentStep(nextStep);
    // Default browser scroll handling (top of container)
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (currentStep === BookingStep.BRANCH_SELECTION) return;
    if (currentStep === BookingStep.MY_BOOKINGS) {
      setCurrentStep(BookingStep.BRANCH_SELECTION);
      return;
    }
    setCurrentStep(currentStep - 1);
  };

  const updateBookingState = (field: keyof BookingState, value: any) => {
    setBookingState(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmBooking = () => {
    // Generate Fake Booking ID: SS-YYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // 251209
    const random = Math.floor(1000 + Math.random() * 9000);
    const newId = `SS-${dateStr}-${random}`;
    
    setBookingId(newId);
    handleStepComplete(BookingStep.SUCCESS);
  };

  const renderStep = () => {
    switch (currentStep) {
      case BookingStep.BRANCH_SELECTION:
        return (
          <BranchSelection 
            onSelect={(b) => {
              updateBookingState('branch', b);
              handleStepComplete(BookingStep.SERVICE_SELECTION);
            }}
            onCheckHistory={() => handleStepComplete(BookingStep.MY_BOOKINGS)}
          />
        );
      case BookingStep.MY_BOOKINGS:
        return <MyBookingsScreen onBack={() => handleBack()} />;
      case BookingStep.SERVICE_SELECTION:
        return (
          <ServiceSelection 
            onSelect={(s) => {
              updateBookingState('service', s);
              handleStepComplete(BookingStep.DATE_SELECTION);
            }} 
          />
        );
      case BookingStep.DATE_SELECTION:
        return (
          <DateSelection 
            selectedDate={bookingState.date}
            onSelect={(d) => {
              updateBookingState('date', d);
              handleStepComplete(BookingStep.TIME_SELECTION);
            }} 
          />
        );
      case BookingStep.TIME_SELECTION:
        return (
          <TimeSelection 
            selectedTime={bookingState.timeSlot}
            onSelect={(t) => {
              updateBookingState('timeSlot', t);
              handleStepComplete(BookingStep.STAFF_SELECTION);
            }} 
          />
        );
      case BookingStep.STAFF_SELECTION:
        return (
          <StaffSelection 
            serviceId={bookingState.service?.id || ''}
            selectedStaff={bookingState.staff}
            date={bookingState.date || new Date()}
            timeSlot={bookingState.timeSlot || {id:'', time:'', available:false}}
            onSelect={(s) => {
              updateBookingState('staff', s);
              handleStepComplete(BookingStep.CONFIRMATION);
            }} 
          />
        );
      case BookingStep.CONFIRMATION:
        return (
          <Confirmation 
            bookingState={bookingState} 
            onChange={(field, val) => updateBookingState(field as keyof BookingState, val)}
            onConfirm={handleConfirmBooking}
          />
        );
      case BookingStep.SUCCESS:
        return <SuccessScreen bookingId={bookingId} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case BookingStep.MY_BOOKINGS: return 'ประวัติการจอง';
      case BookingStep.BRANCH_SELECTION: return 'คลินิกแผนไทย วสส.พล';
      case BookingStep.SERVICE_SELECTION: return 'เลือกบริการ';
      case BookingStep.DATE_SELECTION: return 'เลือกวันที่';
      case BookingStep.TIME_SELECTION: return 'เลือกเวลา';
      case BookingStep.STAFF_SELECTION: return 'เลือกพนักงาน';
      case BookingStep.CONFIRMATION: return 'ยืนยันการจอง';
      case BookingStep.SUCCESS: return 'จองสำเร็จ';
      default: return 'จองคิว';
    }
  };

  // High Contrast Header Logic
  return (
    <div className="min-h-screen bg-primary-50 font-sans text-stone-800 pb-10">
      <div className="max-w-lg mx-auto bg-primary-50 min-h-screen shadow-2xl relative">
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-primary-700 text-white shadow-md transition-all duration-300">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStep > 0 && currentStep !== BookingStep.SUCCESS && (
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-primary-600 transition-colors text-white"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold leading-none drop-shadow-sm">{getStepTitle()}</h1>
                {currentStep === BookingStep.BRANCH_SELECTION && (
                   <p className="text-primary-100 text-xs mt-1">ยินดีต้อนรับเข้าสู่บริการค่ะ</p>
                )}
              </div>
            </div>
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center border border-primary-500 shadow-inner">
              <User size={20} className="text-white" />
            </div>
          </div>
          
          <StepIndicator currentStep={currentStep} />
        </header>

        {/* Content */}
        <main className="p-4 pt-6">
          {renderStep()}
        </main>

        {/* Footer Summary (Sticky Bottom) */}
        {currentStep > BookingStep.BRANCH_SELECTION && currentStep < BookingStep.CONFIRMATION && currentStep !== BookingStep.MY_BOOKINGS && (
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-stone-200 p-4 shadow-lg-up">
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-stone-400 text-xs">สรุปรายการ</span>
                  <div className="flex items-center gap-2 font-medium text-stone-800">
                    {bookingState.branch?.name && <span>{bookingState.branch.name.split('สาขา')[1]}</span>}
                    {bookingState.service && <span>• {bookingState.service.name}</span>}
                  </div>
                  <div className="text-primary-600 font-bold text-xs mt-0.5">
                    {bookingState.date && <span>{formatThaiDate(bookingState.date)}</span>}
                    {bookingState.timeSlot && <span>, {bookingState.timeSlot.time} น.</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
