export type CurrencyType = 'USD' | 'CAD';
export type TripType = 'round-trip' | 'one-way' | 'open-jaw';
export type StopFilter = 'nonstop' | '1stop' | 'any';
export type CabinClass = 'economy' | 'premium' | 'business' | 'first';
export type ChartFormat = 'bar' | 'line';
export type TimeOfDay = 'anytime' | 'morning' | 'afternoon' | 'evening';

export type ThemeId =
  | 'fantasmic-sorcerer'
  | 'tomorrowland-tron'
  | 'haunted-mansion'
  | 'forbidden-mountain'
  | 'main-street-sunshine'
  | 'cinderella-castle'
  | 'neverland-skies'
  | 'epcot-spaceship-earth';

export interface Airport {
  iata: string;
  city: string;
  name: string;
}

export interface AirlineItem {
  code: string;
  name: string;
}

export interface VerifiedSpot {
  dayIndex: number;
  price: number;
  date: string;
  carrier?: string;
  note?: string;
  leg?: 'outbound' | 'return' | 'both';
}

export interface HolidayEvent {
  id: string;
  name: string;
  emoji: string;
  surgeMultiplier: number;
}

export interface Route {
  id: string;
  tag: string;
  origin: string;
  dest: string;
  returnOrigin?: string; // Open-jaw support
  returnDest?: string;   // Open-jaw support
  currency: CurrencyType;
  horizon: number;
  trackingDuration: number;
  currentPrice: number;
  dataPoints: number[];
  historyLog: string[];
  tripType: TripType;
  depDate: string;
  retDate: string;
  pax: number | string;
  cabin: CabinClass;
  stopFilter: StopFilter;
  preBuffer: number | string;
  coreSpan: number | string;
  postBuffer: number | string;
  airlines: string[];
  latestNote?: string;
  verifiedSpots?: VerifiedSpot[];
  // v1 Enhancements
  targetFares?: Partial<Record<CabinClass, number>>; // Proposal 1: Multi-cabin target memory
  excludeBasicEconomy?: boolean;                    // Carry-on guarantee
  timeOfDay?: TimeOfDay;                            // Preferred departure time window
  holidayDays?: (HolidayEvent | null)[] | { dayIndex: number; holiday: HolidayEvent }[];
  isTargetHitCelebrated?: boolean | Partial<Record<CabinClass, boolean>>;
  notes?: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  collapsing?: boolean;
  isCelebration?: boolean;
}
