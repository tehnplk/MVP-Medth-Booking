import React, { useState, useEffect } from 'react';
import { BookingStep, BookingState, Service, TimeSlot, Staff } from './types';
import { SERVICES, STAFF_MEMBERS, GENERATE_TIME_SLOTS, SHOP_CONFIG, STAFF_SCHEDULES } from './constants';
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
  XCircle
} from 'lucide-react';

// --- Helper Functions ---

const formatThaiDate = (date: Date) => {
  const day = date.getDate();
  const month = new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(date);
  const year = (date.getFullYear() + 543).toString().slice(-2);
  return `${day} ${month} ${year}`;
};

const toISODateString = (date: Date) => {
  // Use local time for date string to avoid timezone shifts
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

// --- Sub-components defined here for simplicity in single-file stricture ---

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
      <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-3xl border border-primary-100 shadow-sm">
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
                {formatThaiDate(date)}
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
    setSlots(GENERATE_TIME_SLOTS(SHOP_CONFIG.openTime, SHOP_CONFIG.closeTime));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary-100 p-3 rounded-full text-primary-600">
          <Clock size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">เลือกเวลา</h2>
          <p className="text-base text-stone-500">ร้านเปิด {SHOP_CONFIG.openTime}:00 - {SHOP_CONFIG.closeTime}:00 น.</p>
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
                <h3 className={`text-xl font-bold mb-1 ${!available ? 'text-stone-500' : 'text-stone-900'}`}>{staff.name}</h3>
                <p className={`text-base font-medium inline-block px-2 py-0.5 rounded-lg mb-2 ${!available ? 'bg-stone-200 text-stone-500' : 'text-primary-700 bg-primary-100'}`}>
                  {staff.role}
                </p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className={`w-4 h-4 rounded-full ${!available ? 'bg-stone-200' : 'bg-yellow-400'}`} />)}
                </div>
              </div>
              
              {available && (
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors
                  ${isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-stone-300 text-transparent'}
                `}>
                  <CheckCircle2 size={24} strokeWidth={3} />
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
  booking, 
  onConfirm,
  isProcessing
}: { 
  booking: BookingState, 
  onConfirm: (details: {name: string, phone: string}) => void,
  isProcessing: boolean
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState({ name: false, phone: false });

  // 1. Strip non-digits to get raw value
  const rawPhone = phone.replace(/\D/g, '');
  
  // 2. Validate strict Thai mobile regex: Starts with 06, 08, 09 followed by 8 digits (total 10)
  const isValidMobile = /^0[689]\d{8}$/.test(rawPhone);
  
  // 3. Name validation
  const isValidName = name.trim().length > 0;

  // 4. Can submit?
  const canSubmit = isValidName && isValidMobile;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const input = e.target.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = input.slice(0, 10);
    
    // Mask as 0XX-XXX-XXXX
    let formatted = limited;
    if (limited.length > 6) {
      formatted = `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else if (limited.length > 3) {
      formatted = `${limited.slice(0, 3)}-${limited.slice(3)}`;
    }
    
    setPhone(formatted);
    setTouched(prev => ({ ...prev, phone: true }));
  };

  const handleBlur = (field: 'name' | 'phone') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = () => {
    setTouched({ name: true, phone: true });
    if (canSubmit) onConfirm({ name, phone });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <div className="flex items-center gap-3">
        <div className="bg-primary-100 p-3 rounded-full text-primary-600">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-stone-800">สรุปข้อมูลการจอง</h2>
      </div>
      
      {/* Booking Summary Card */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-primary-100 space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b-2 border-stone-100">
          <img src={booking.service?.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm" alt="" />
          <div>
            <h3 className="text-xl font-bold text-stone-900 mb-1">{booking.service?.name}</h3>
            <p className="text-lg text-stone-600">{booking.service?.duration} นาที • <span className="text-primary-600 font-bold">{booking.service?.price} บ.</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-lg">
          <div className="flex items-center gap-3 bg-stone-50 p-4 rounded-xl">
            <div className="bg-white p-2 rounded-full shadow-sm text-primary-500">
              <Calendar size={24}/>
            </div>
            <div>
              <div className="text-sm text-stone-500">วันที่</div>
              <div className="font-bold text-stone-800">
                {booking.date && formatThaiDate(booking.date)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-stone-50 p-4 rounded-xl">
            <div className="bg-white p-2 rounded-full shadow-sm text-primary-500">
              <Clock size={24}/>
            </div>
            <div>
              <div className="text-sm text-stone-500">เวลา</div>
              <div className="font-bold text-stone-800">{booking.timeSlot?.time} น.</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-stone-50 p-4 rounded-xl">
            <div className="bg-white p-2 rounded-full shadow-sm text-primary-500">
              <User size={24}/>
            </div>
            <div>
              <div className="text-sm text-stone-500">พนักงาน</div>
              <div className="font-bold text-stone-800">{booking.staff?.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Input Form */}
      <div className="bg-stone-50 rounded-3xl p-6 space-y-6 border border-stone-200 shadow-inner">
        <h4 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <User size={24} className="text-primary-600"/>
          ข้อมูลผู้จอง
        </h4>
        
        <div className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="text-lg font-bold text-stone-700 mb-2 block">
              ชื่อ - นามสกุล <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`
                w-full px-5 py-4 rounded-xl border-2 text-xl outline-none shadow-sm transition-all
                placeholder:text-stone-300
                ${touched.name && !isValidName 
                  ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' 
                  : 'border-stone-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'}
              `}
              placeholder="ระบุชื่อของคุณ"
            />
            {touched.name && !isValidName && (
              <p className="text-red-500 mt-2 flex items-center gap-1 text-base font-medium">
                <AlertCircle size={18}/> กรุณาระบุชื่อ
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="text-lg font-bold text-stone-700 mb-2 block">
              เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input 
                type="tel" 
                value={phone}
                onChange={handlePhoneChange}
                onBlur={() => handleBlur('phone')}
                maxLength={12} // 0xx-xxx-xxxx
                inputMode="numeric"
                className={`
                  w-full pl-12 pr-5 py-4 rounded-xl border-2 text-xl outline-none shadow-sm transition-all font-mono tracking-wide
                  placeholder:text-stone-300 placeholder:font-sans placeholder:tracking-normal
                  ${touched.phone && !isValidMobile
                    ? 'border-red-400 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                    : 'border-stone-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'}
                `}
                placeholder="0xx-xxx-xxxx"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                <Phone size={24} />
              </div>
            </div>
            
            {touched.phone && !isValidMobile ? (
              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <p className="text-red-600 text-base leading-tight">
                  กรุณากรอกเบอร์มือถือ 10 หลักให้ถูกต้อง <br/>
                  (ขึ้นต้นด้วย 06, 08 หรือ 09)
                </p>
              </div>
            ) : (
              <p className="text-stone-500 mt-2 text-sm">
                * ระบบจะส่งยืนยันการจองไปที่เบอร์นี้
              </p>
            )}
          </div>
        </div>
      </div>

      <Button 
        fullWidth 
        onClick={handleSubmit} 
        disabled={isProcessing || (touched.phone && !canSubmit)}
        className={`
          !py-5 !text-xl !rounded-2xl shadow-xl font-bold
          ${(!canSubmit && touched.phone) ? '!bg-stone-300 !text-stone-500 !shadow-none cursor-not-allowed border-none' : ''}
        `}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="animate-spin" size={24} /> กำลังยืนยัน...
          </div>
        ) : 'ยืนยันการจอง'}
      </Button>
    </div>
  );
};

// 6. Success Component
const SuccessScreen = () => (
  <div className="flex flex-col items-center justify-center py-16 px-6 space-y-6 animate-fade-in text-center h-full">
    <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce shadow-lg">
      <CheckCircle2 size={64} />
    </div>
    <h2 className="text-3xl font-bold text-stone-800">จองสำเร็จเรียบร้อย!</h2>
    <p className="text-lg text-stone-500 max-w-sm mx-auto leading-relaxed">
      ขอบคุณที่ใช้บริการค่ะ <br/>ระบบได้ส่งรายละเอียดการจองไปยังเบอร์โทรศัพท์ของคุณแล้ว
    </p>
    <div className="pt-10 w-full max-w-xs">
      <Button variant="outline" fullWidth onClick={() => window.location.reload()} className="!py-4 !text-lg !rounded-xl">
        กลับหน้าหลัก
      </Button>
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.SERVICE_SELECTION);
  const [isProcessing, setIsProcessing] = useState(false);
  const [booking, setBooking] = useState<BookingState>({
    service: null,
    date: null,
    timeSlot: null,
    staff: null,
    customerName: '',
    customerPhone: ''
  });

  const nextStep = () => {
    if (currentStep < BookingStep.CONFIRMATION) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > BookingStep.SERVICE_SELECTION) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleConfirmBooking = (customerData: {name: string, phone: string}) => {
    setBooking(prev => ({
      ...prev,
      customerName: customerData.name,
      customerPhone: customerData.phone
    }));

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(BookingStep.SUCCESS);
    }, 2000);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const canProceed = () => {
    switch (currentStep) {
      case BookingStep.SERVICE_SELECTION: return !!booking.service;
      case BookingStep.DATE_SELECTION: return !!booking.date;
      case BookingStep.TIME_SELECTION: return !!booking.timeSlot;
      case BookingStep.STAFF_SELECTION: return !!booking.staff;
      default: return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case BookingStep.SERVICE_SELECTION: return 'เลือกบริการ';
      case BookingStep.DATE_SELECTION: return 'เลือกวันที่';
      case BookingStep.TIME_SELECTION: return 'เลือกเวลา';
      case BookingStep.STAFF_SELECTION: return 'เลือกพนักงาน';
      case BookingStep.CONFIRMATION: return 'ยืนยันข้อมูล';
      default: return 'จองสำเร็จ';
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900">
      <div className="max-w-lg mx-auto bg-stone-50 min-h-screen shadow-2xl relative flex flex-col">
        
        {/* Large Header for Elderly */}
        <header className="bg-white px-6 py-5 flex items-center justify-between sticky top-0 z-50 shadow-md border-b border-stone-100">
          <div className="flex items-center gap-3">
            {currentStep > 0 && currentStep !== BookingStep.SUCCESS && (
              <button 
                onClick={prevStep} 
                className="p-2 -ml-3 text-stone-600 hover:bg-stone-100 rounded-full active:bg-stone-200 transition-colors"
                aria-label="ย้อนกลับ"
              >
                <ChevronLeft size={32} />
              </button>
            )}
            <div>
              <h1 className="font-bold text-2xl text-primary-800 leading-none">
                SiamSerenity
              </h1>
              <p className="text-sm text-stone-500 font-medium mt-1">{getStepTitle()}</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 shadow-sm border border-primary-200">
            <User size={20} />
          </div>
        </header>

        {/* Improved Progress Indicator */}
        <div className="bg-white pb-2">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Main Content */}
        <main className="flex-1 px-5 py-6 overflow-y-auto">
          {currentStep === BookingStep.SERVICE_SELECTION && (
            <ServiceSelection 
              onSelect={(s) => { setBooking({...booking, service: s}); nextStep(); }} 
              recommendedId={undefined}
            />
          )}
          
          {currentStep === BookingStep.DATE_SELECTION && (
            <DateSelection 
              selectedDate={booking.date} 
              onSelect={(d) => setBooking(prev => ({...prev, date: d}))} 
            />
          )}

          {currentStep === BookingStep.TIME_SELECTION && (
            <TimeSelection 
              selectedTime={booking.timeSlot} 
              onSelect={(t) => setBooking(prev => ({...prev, timeSlot: t}))} 
            />
          )}

          {currentStep === BookingStep.STAFF_SELECTION && booking.service && booking.date && booking.timeSlot && (
            <StaffSelection 
              serviceId={booking.service.id}
              selectedStaff={booking.staff} 
              date={booking.date}
              timeSlot={booking.timeSlot}
              onSelect={(s) => setBooking(prev => ({...prev, staff: s}))} 
            />
          )}

          {currentStep === BookingStep.CONFIRMATION && (
            <Confirmation 
              booking={booking} 
              onConfirm={handleConfirmBooking}
              isProcessing={isProcessing}
            />
          )}

          {currentStep === BookingStep.SUCCESS && (
            <SuccessScreen />
          )}
        </main>

        {/* Large Bottom Navigation Bar */}
        {currentStep !== BookingStep.SERVICE_SELECTION && 
         currentStep !== BookingStep.CONFIRMATION && 
         currentStep !== BookingStep.SUCCESS && (
          <div className="sticky bottom-0 left-0 right-0 p-5 bg-white border-t border-stone-200 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-stone-500 font-medium">รายการที่เลือก:</span>
              <span className="text-primary-700 font-bold text-lg">
                {currentStep === BookingStep.DATE_SELECTION && (booking.date ? formatThaiDate(booking.date) : '-')}
                {currentStep === BookingStep.TIME_SELECTION && (booking.timeSlot ? booking.timeSlot.time + ' น.' : '-')}
                {currentStep === BookingStep.STAFF_SELECTION && (booking.staff ? booking.staff.name : '-')}
              </span>
            </div>
            <Button 
              fullWidth 
              onClick={nextStep} 
              disabled={!canProceed()}
              className={`
                !py-4 !text-xl !rounded-2xl font-bold shadow-lg
                ${!canProceed() ? '!bg-stone-200 !text-stone-400 !shadow-none border-none' : ''}
              `}
            >
              ถัดไป
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;