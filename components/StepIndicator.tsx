
import React from 'react';
import { BookingStep } from '../types';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: BookingStep;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: BookingStep.BRANCH_SELECTION, label: 'สาขา' },
    { id: BookingStep.SERVICE_SELECTION, label: 'บริการ' },
    { id: BookingStep.DATE_SELECTION, label: 'วันที่' },
    { id: BookingStep.TIME_SELECTION, label: 'เวลา' },
    { id: BookingStep.STAFF_SELECTION, label: 'พนักงาน' },
    { id: BookingStep.CONFIRMATION, label: 'ยืนยัน' },
  ];

  if (currentStep === BookingStep.SUCCESS || currentStep === BookingStep.MY_BOOKINGS) return null;

  return (
    <div className="w-full px-4 py-4 bg-white border-b border-stone-100">
      <div className="flex items-center justify-between relative max-w-lg mx-auto">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-stone-200 -z-10" />
        
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-1 bg-white px-1">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isCompleted ? 'bg-primary-600 text-white' : isCurrent ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500' : 'bg-stone-100 text-stone-400'}
                `}
              >
                {isCompleted ? <Check size={14} /> : step.id + 1}
              </div>
              <span className={`text-[10px] font-medium ${isCurrent ? 'text-primary-700' : 'text-stone-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
