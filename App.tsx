import React, { useState, useEffect, useCallback } from 'react';
import { BookingStep, BookingState, Service, TimeSlot, Staff } from './types';
import { SERVICES, STAFF_MEMBERS, GENERATE_TIME_SLOTS } from './constants';
import { StepIndicator } from './components/StepIndicator';
import { Button } from './components/Button';
import { getServiceRecommendation } from './services/geminiService';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Loader2,
  Info
} from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-primary-50 to-white p-5 rounded-2xl border border-primary-100 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-900 mb-1">ให้ AI ช่วยเลือกบริการ?</h3>
            <p className="text-sm text-stone-500 mb-3">บอกอาการของคุณ เช่น "ปวดหลังจากการนั่งทำงาน" หรือ "อยากผ่อนคลาย"</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="พิมพ์อาการของคุณที่นี่..."
                className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
              />
              <Button 
                onClick={handleAskAI} 
                disabled={isThinking || !prompt}
                className="!py-2 !px-3 !rounded-lg text-sm"
              >
                {isThinking ? <Loader2 className="animate-spin" size={16} /> : 'แนะนำ'}
              </Button>
            </div>
            {aiResult && (
              <div className="mt-3 bg-white p-3 rounded-lg border border-primary-200 text-sm text-stone-700">
                <span className="font-bold text-primary-700">แนะนำ:</span> {aiResult.reason}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SERVICES.map((service) => {
          const isRecommended = aiResult?.id === service.id;
          return (
            <div 
              key={service.id}
              onClick={() => onSelect(service)}
              className={`
                relative flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md
                ${isRecommended ? 'border-primary-500 bg-primary-50/50' : 'border-stone-100 bg-white hover:border-primary-200'}
              `}
            >
              {isRecommended && (
                <div className="absolute -top-3 right-4 bg-primary-600 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">
                  แนะนำสำหรับคุณ
                </div>
              )}
              <img src={service.image} alt={service.name} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
              <div className="ml-4 flex-1">
                <h3 className="font-bold text-stone-800">{service.name}</h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-primary-600">{service.price} บาท</span>
                  <span className="text-xs text-stone-400">{service.duration} นาที</span>
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' }).format(date);
  };

  const getDayName = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', { weekday: 'short' }).format(date);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-stone-800">เลือกวันที่รับบริการ</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {dates.map((date, idx) => {
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          return (
            <button
              key={idx}
              onClick={() => onSelect(date)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-stone-100 bg-white text-stone-600 hover:border-primary-200'}
              `}
            >
              <span className="text-xs font-medium opacity-70">{getDayName(date)}</span>
              <span className="text-lg font-bold">{formatDate(date)}</span>
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
    // Simulate fetching slots
    setSlots(GENERATE_TIME_SLOTS());
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-stone-800">เลือกเวลา</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedTime?.id === slot.id;
          return (
            <button
              key={slot.id}
              disabled={!slot.available}
              onClick={() => onSelect(slot)}
              className={`
                py-3 rounded-xl border font-medium text-sm transition-all relative overflow-hidden
                ${!slot.available 
                  ? 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed decoration-stone-300' 
                  : isSelected 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md transform scale-105' 
                    : 'bg-white text-stone-700 border-stone-200 hover:border-primary-400'}
              `}
            >
              {slot.time}
              {!slot.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-50/50">
                  <div className="w-full h-[1px] bg-stone-300 rotate-45 absolute"></div>
                </div>
              )}
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
  onSelect 
}: { 
  serviceId: string,
  selectedStaff: Staff | null, 
  onSelect: (s: Staff) => void 
}) => {
  // Filter staff based on service capability (mock logic)
  const availableStaff = STAFF_MEMBERS.filter(s => s.specialty.includes(serviceId));

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-stone-800">เลือกพนักงาน</h2>
      <p className="text-stone-500 text-sm">พนักงานที่เชี่ยวชาญในบริการที่คุณเลือก</p>
      
      <div className="space-y-3">
        {availableStaff.map((staff) => {
          const isSelected = selectedStaff?.id === staff.id;
          return (
            <div
              key={staff.id}
              onClick={() => onSelect(staff)}
              className={`
                flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-stone-100 bg-white hover:border-primary-200'}
              `}
            >
              <img 
                src={staff.image} 
                alt={staff.name} 
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" 
              />
              <div className="ml-4 flex-1">
                <h3 className="font-bold text-stone-800">{staff.name}</h3>
                <p className="text-xs text-primary-600 font-medium">{staff.role}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {/* Mock stars */}
                  {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-yellow-400" />)}
                </div>
              </div>
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-stone-300'}
              `}>
                {isSelected && <CheckCircle2 size={14} />}
              </div>
            </div>
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
  onConfirm: () => void,
  isProcessing: boolean
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Validate: Name exists and Phone has exactly 10 digits
  const canSubmit = name.trim().length > 0 && phone.replace(/\D/g, '').length === 10;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, ''); // Keep only numbers
    if (raw.length > 10) raw = raw.slice(0, 10); // Limit to 10 digits

    // Format: 0XX-XXX-XXXX
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    }

    setPhone(formatted);
  };

  const handleSubmit = () => {
    // In a real app, update booking state with customer info here first
    if (canSubmit) onConfirm();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-stone-800">สรุปข้อมูลการจอง</h2>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-stone-100">
          <img src={booking.service?.image} className="w-16 h-16 rounded-lg object-cover" alt="" />
          <div>
            <h3 className="font-bold text-stone-800">{booking.service?.name}</h3>
            <p className="text-sm text-stone-500">{booking.service?.duration} นาที • {booking.service?.price} บาท</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-stone-400 flex items-center gap-1"><Calendar size={12}/> วันที่</span>
            <span className="font-medium text-stone-700">
              {booking.date && new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(booking.date)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-stone-400 flex items-center gap-1"><Clock size={12}/> เวลา</span>
            <span className="font-medium text-stone-700">{booking.timeSlot?.time}</span>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <span className="text-xs text-stone-400 flex items-center gap-1"><User size={12}/> พนักงานดูแล</span>
            <div className="flex items-center gap-2">
              <img src={booking.staff?.image} className="w-6 h-6 rounded-full" alt="" />
              <span className="font-medium text-stone-700">{booking.staff?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-stone-50 rounded-xl p-4 space-y-4">
        <h4 className="font-semibold text-stone-700">ข้อมูลผู้จอง</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-stone-500 mb-1 block">ชื่อ - นามสกุล</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="ระบุชื่อของคุณ"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 mb-1 block">เบอร์โทรศัพท์ (มือถือ)</label>
            <input 
              type="tel" 
              value={phone}
              onChange={handlePhoneChange}
              maxLength={12} // 10 digits + 2 hyphens
              className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="0xx-xxx-xxxx"
            />
          </div>
        </div>
      </div>

      <Button 
        fullWidth 
        onClick={handleSubmit} 
        disabled={!canSubmit || isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} /> กำลังยืนยัน...
          </div>
        ) : 'ยืนยันการจอง'}
      </Button>
    </div>
  );
};

// 6. Success Component
const SuccessScreen = () => (
  <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-fade-in text-center">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
      <CheckCircle2 size={40} />
    </div>
    <h2 className="text-2xl font-bold text-stone-800">จองสำเร็จ!</h2>
    <p className="text-stone-500 max-w-xs mx-auto">
      ขอบคุณที่ใช้บริการ ระบบได้ส่งรายละเอียดการจองไปยังเบอร์โทรศัพท์ของคุณแล้ว
    </p>
    <div className="pt-8">
      <Button variant="outline" onClick={() => window.location.reload()}>
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

  const handleConfirmBooking = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(BookingStep.SUCCESS);
    }, 2000);
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Bottom Navigation Bar Logic
  const canProceed = () => {
    switch (currentStep) {
      case BookingStep.SERVICE_SELECTION: return !!booking.service;
      case BookingStep.DATE_SELECTION: return !!booking.date;
      case BookingStep.TIME_SELECTION: return !!booking.timeSlot;
      case BookingStep.STAFF_SELECTION: return !!booking.staff;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-stone-50 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          {currentStep > 0 && currentStep !== BookingStep.SUCCESS && (
            <button onClick={prevStep} className="p-1 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full">
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="font-sans font-bold text-xl text-primary-800 tracking-tight">
            SiamSerenity
          </h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
          <User size={16} />
        </div>
      </header>

      {/* Progress */}
      <StepIndicator currentStep={currentStep} />

      {/* Content Area */}
      <main className="px-6 py-6">
        {currentStep === BookingStep.SERVICE_SELECTION && (
          <ServiceSelection 
            onSelect={(s) => { setBooking({...booking, service: s}); nextStep(); }} 
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

        {currentStep === BookingStep.STAFF_SELECTION && booking.service && (
          <StaffSelection 
            serviceId={booking.service.id}
            selectedStaff={booking.staff} 
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

      {/* Sticky Bottom Bar for Navigation (Steps 1-3) */}
      {currentStep !== BookingStep.SERVICE_SELECTION && 
       currentStep !== BookingStep.CONFIRMATION && 
       currentStep !== BookingStep.SUCCESS && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200 z-40 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-stone-500">
              {currentStep === BookingStep.DATE_SELECTION && booking.date && 'เลือก: ' + booking.date.toLocaleDateString('th-TH')}
              {currentStep === BookingStep.TIME_SELECTION && booking.timeSlot && 'เลือก: ' + booking.timeSlot.time}
              {currentStep === BookingStep.STAFF_SELECTION && booking.staff && 'เลือก: ' + booking.staff.name}
            </div>
          </div>
          <Button 
            fullWidth 
            onClick={nextStep} 
            disabled={!canProceed()}
            className={!canProceed() ? 'opacity-50' : ''}
          >
            ถัดไป
          </Button>
        </div>
      )}
    </div>
  );
};

export default App;