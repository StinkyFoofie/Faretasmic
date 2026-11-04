import { Airport, AirlineItem, ThemeId } from './types';

export const APP_CONFIG = {
  APP_TITLE: "✨ Faretasmic!!!!!",
  APP_VERSION: "v0.8",
  FIREBASE: {
    apiKey: "AIzaSyDtUAQVNKqQQ-nIVPIzHZuW7gUjg1j7C_c",
    authDomain: "faretasmic.firebaseapp.com",
    projectId: "faretasmic"
  },
  DEFAULT_FAILSAFE_LOCKOUT_CALLS: 950,
  MAXIMUM_FREE_TIER_MONTHLY_CALLS: 1000,
  DEFAULT_CABIN_CLASS: "economy" as const,
  DEFAULT_HOME_ORIGIN_AIRPORT_IATA: "SFO",
  ENABLE_DEV_DATA_SHUFFLE: true,

  BTN_ADD_FLIGHT_EMPTY: "Add Flight",
  BTN_ADD_FLIGHT_MAIN: "Add Flight",
  BTN_BOOK_SEARCH: "💳 Book/Search Flights 🌐",
  BTN_EXPORT_CSV: "📥 EXPORT CSV",
  BTN_START_TRACKING: "Start Tracking",
  BTN_UNTRACK: "🗑️ UNTRACK",

  EMOJI_BTN_SETTINGS: "⚙️",
  EMOJI_BTN_SHUFFLE_QA: "🎲",
  EMOJI_BTN_THEME: "🎨",

  EMPTY_STATE_SUBTITLE: "Configure a route to begin price surveillance.",
  EMPTY_STATE_TITLE: "🔭 No Flights Monitored",
  PLACEHOLDER_ADD_CARRIER: "+ Add Carrier...",
  PLACEHOLDER_DESTINATION_IATA: "Select Destination",
  PLACEHOLDER_SELECT_ROUTE: "-- Select Route --",
  PLACEHOLDER_TRIP_NAME: "Another Disney Vacation...",
  TOAST_FLIGHT_ADDED: "🚀 Flight Added! Surveillance Active",
  TOAST_SETTINGS_SAVED: "⚙️ Settings Successfully Saved",

  TOOLTIP_BTN_SETTINGS: "Settings",
  TOOLTIP_BTN_SHUFFLE_QA: "Shuffle QA",
  TOOLTIP_BTN_THEME: "Theme"
};

export const THEMES_LIST: { id: ThemeId | 'random'; label: string; isRandom?: boolean }[] = [
  { id: 'random', label: '🎲 Random', isRandom: true },
  { id: 'cozy-village', label: '🌿 Cozy Village' },
  { id: 'cyberpunk', label: '⚡ Cyberpunk' },
  { id: 'gothic-crimson', label: '🍷 Gothic Crimson' },
  { id: 'minimalist-light', label: '⚪ Minimalist Light' },
  { id: 'modern-dark', label: '🌑 Modern Dark' },
  { id: 'modern-light', label: '☀️ Modern Light' },
  { id: 'retro-arcade', label: '🕹️ Retro Arcade' },
  { id: 'synthwave-sunset', label: '🌆 Synthwave Sunset' },
  { id: 'wasteland-terminal', label: '📟 Wasteland Terminal' }
];

export const AIRPORT_DICTIONARY: Airport[] = [
  { iata: "SFO", city: "San Francisco", name: "SFO Int." },
  { iata: "JFK", city: "New York", name: "John F. Kennedy" },
  { iata: "LAX", city: "Los Angeles", name: "LAX Int." },
  { iata: "ORD", city: "Chicago", name: "O'Hare" },
  { iata: "SEA", city: "Seattle", name: "Seattle-Tacoma" },
  { iata: "HND", city: "Tokyo", name: "Haneda" },
  { iata: "NRT", city: "Tokyo", name: "Narita" },
  { iata: "LHR", city: "London", name: "Heathrow" },
  { iata: "CDG", city: "Paris", name: "Charles de Gaulle" },
  { iata: "YYZ", city: "Toronto", name: "Pearson Int." },
  { iata: "YVR", city: "Vancouver", name: "Vancouver Int." },
  { iata: "YUL", city: "Montreal", name: "Trudeau" },
  { iata: "YYC", city: "Calgary", name: "Calgary Int." },
  { iata: "YOW", city: "Ottawa", name: "Macdonald-Cartier" },
  { iata: "MCO", city: "Orlando", name: "Orlando Int." },
  { iata: "SLC", city: "Salt Lake City", name: "Salt Lake City Int." },
  { iata: "ATL", city: "Atlanta", name: "Hartsfield-Jackson" },
  { iata: "DFW", city: "Dallas/Fort Worth", name: "DFW Int." },
  { iata: "DEN", city: "Denver", name: "Denver Int." },
  { iata: "MIA", city: "Miami", name: "Miami Int." },
  { iata: "CLT", city: "Charlotte", name: "Douglas Int." },
  { iata: "PHX", city: "Phoenix", name: "Sky Harbor" },
  { iata: "IAH", city: "Houston", name: "George Bush Intercontinental" },
  { iata: "BOS", city: "Boston", name: "Logan Int." },
  { iata: "MSP", city: "Minneapolis", name: "St. Paul Int." },
  { iata: "DTW", city: "Detroit", name: "Metropolitan Wayne" },
  { iata: "PHL", city: "Philadelphia", name: "Philadelphia Int." },
  { iata: "SAN", city: "San Diego", name: "San Diego Int." },
  { iata: "TPA", city: "Tampa", name: "Tampa Int." },
  { iata: "PDX", city: "Portland", name: "Portland Int." },
  { iata: "HNL", city: "Honolulu", name: "Daniel K. Inouye Int." }
];

export const AIRLINE_GROUPS: Record<string, AirlineItem[]> = {
  "North America": [
    { code: "AC", name: "Air Canada (AC)" },
    { code: "AS", name: "Alaska Airlines (AS)" },
    { code: "AA", name: "American Airlines (AA)" },
    { code: "DL", name: "Delta Air Lines (DL)" },
    { code: "B6", name: "JetBlue Airways (B6)" },
    { code: "WN", name: "Southwest Airlines (WN)" },
    { code: "UA", name: "United Airlines (UA)" },
    { code: "WS", name: "WestJet (WS)" }
  ],
  "Asia": [
    { code: "NH", name: "All Nippon Airways (NH)" },
    { code: "OZ", name: "Asiana Airlines (OZ)" },
    { code: "CX", name: "Cathay Pacific (CX)" },
    { code: "CI", name: "China Airlines (CI)" },
    { code: "BR", name: "EVA Air (BR)" },
    { code: "JL", name: "Japan Airlines (JL)" },
    { code: "KE", name: "Korean Air (KE)" },
    { code: "SQ", name: "Singapore Airlines (SQ)" }
  ],
  "Europe": [
    { code: "AF", name: "Air France (AF)" },
    { code: "BA", name: "British Airways (BA)" },
    { code: "LH", name: "Lufthansa (LH)" }
  ]
};
