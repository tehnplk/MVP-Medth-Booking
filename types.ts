export enum BookingStep {
  SERVICE_SELECTION = 0,
  DATE_SELECTION = 1,
  TIME_SELECTION = 2,
  STAFF_SELECTION = 3,
  CONFIRMATION = 4,
  SUCCESS = 5,
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number; // THB
  image: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  image: string;
  specialty: string[];
}

export interface TimeSlot {
  id: string;
  time: string; // "10:00"
  available: boolean;
}

export interface BookingState {
  service: Service | null;
  date: Date | null;
  timeSlot: TimeSlot | null;
  staff: Staff | null;
  customerName: string;
  customerPhone: string;
}

export interface AIRecommendation {
  recommendedServiceId: string;
  reasoning: string;
}
