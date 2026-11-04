export type CurrencyType = 'USD' | 'CAD';
export type TripType = 'round-trip' | 'one-way';
export type StopFilter = 'nonstop' | '1stop' | 'any';
export type CabinClass = 'economy' | 'premium' | 'business' | 'first';
export type ChartFormat = 'bar' | 'line';

export type ThemeId =
  | 'modern-dark'
  | 'minimalist-light'
  | 'modern-light'
  | 'retro-arcade'
  | 'synthwave-sunset'
  | 'cyberpunk'
  | 'gothic-crimson'
  | 'wasteland-terminal'
  | 'cozy-village';

export interface Airport {
  iata: string;
  city: string;
  name: string;
}

export interface AirlineItem {
  code: string;
  name: string;
}

export interface Route {
  id: string;
  tag: string;
  origin: string;
  dest: string;
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
}

export interface ToastMessage {
  id: string;
  text: string;
  collapsing?: boolean;
}
