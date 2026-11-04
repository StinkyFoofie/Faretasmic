import { Route, CabinClass, CurrencyType, HolidayEvent } from '../types';

// Regional classification for realistic distance baselines
export type RegionTier = 'DOMESTIC_SHORT' | 'DOMESTIC_TRANSCON' | 'TRANSATLANTIC' | 'TRANSPACIFIC';

const EUROPEAN_HUBS = new Set(['LHR', 'CDG']);
const ASIAN_HUBS = new Set(['HND', 'NRT']);
const CANADIAN_HUBS = new Set(['YYZ', 'YVR', 'YUL', 'YYC', 'YOW']);

export function getRouteTier(origin: string, dest: string): RegionTier {
  const o = origin.slice(0, 3).toUpperCase();
  const d = dest.slice(0, 3).toUpperCase();

  if (EUROPEAN_HUBS.has(o) || EUROPEAN_HUBS.has(d)) {
    return 'TRANSATLANTIC';
  }
  if (ASIAN_HUBS.has(o) || ASIAN_HUBS.has(d)) {
    return 'TRANSPACIFIC';
  }

  // Cross-country hubs (West Coast to East Coast / South)
  const west = new Set(['SFO', 'LAX', 'SEA', 'PDX', 'SAN', 'YVR']);
  const east = new Set(['JFK', 'BOS', 'MIA', 'MCO', 'ATL', 'CLT', 'PHL', 'YYZ', 'YUL', 'YOW']);

  if ((west.has(o) && east.has(d)) || (east.has(o) && west.has(d))) {
    return 'DOMESTIC_TRANSCON';
  }

  return 'DOMESTIC_SHORT';
}

export function isCanadianRoute(origin: string, dest: string): boolean {
  const o = origin.slice(0, 3).toUpperCase();
  const d = dest.slice(0, 3).toUpperCase();
  return CANADIAN_HUBS.has(o) || CANADIAN_HUBS.has(d);
}

export function calculateBaseRoutePrice(origin: string, dest: string, currency: CurrencyType): number {
  const tier = getRouteTier(origin, dest);
  let baseUsd = 160;

  switch (tier) {
    case 'DOMESTIC_SHORT':
      baseUsd = Math.floor(Math.random() * 60) + 140; // $140 - $200
      break;
    case 'DOMESTIC_TRANSCON':
      baseUsd = Math.floor(Math.random() * 120) + 340; // $340 - $460
      break;
    case 'TRANSATLANTIC':
      baseUsd = Math.floor(Math.random() * 250) + 720; // $720 - $970
      break;
    case 'TRANSPACIFIC':
      baseUsd = Math.floor(Math.random() * 300) + 880; // $880 - $1180
      break;
  }

  return currency === 'CAD' ? Math.round(baseUsd * 1.36) : baseUsd;
}

// Region-Aware Holiday Calendar Detection
export function detectHolidayWindow(date: Date, origin: string, dest: string): HolidayEvent | null {
  const month = date.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon...
  const isCan = isCanadianRoute(origin, dest);
  const tier = getRouteTier(origin, dest);

  // 1. Christmas & New Year's Peak (Dec 18 - Jan 4)
  if ((month === 11 && day >= 18) || (month === 0 && day <= 4)) {
    return {
      id: 'xmas_newyear',
      name: month === 11 && day <= 26 ? 'Christmas Peak' : "New Year's Rush",
      emoji: month === 11 && day <= 26 ? '🎄' : '🎆',
      surgeMultiplier: 1.65,
    };
  }

  // 2. Thanksgiving Rush (US: 4th Thursday of Nov +- 4 days; Canada: 2nd Monday of Oct +- 3 days)
  if (isCan) {
    if (month === 9 && day >= 8 && day <= 15) {
      return { id: 'thanksgiving_ca', name: 'Canadian Thanksgiving', emoji: '🍂', surgeMultiplier: 1.32 };
    }
  } else {
    if (month === 10 && day >= 20 && day <= 30) {
      return { id: 'thanksgiving_us', name: 'Thanksgiving Rush', emoji: '🦃', surgeMultiplier: 1.55 };
    }
  }

  // 3. Transpacific Regional: Lunar New Year (Late Jan - Mid Feb) & Japan Golden Week (Apr 29 - May 5)
  if (tier === 'TRANSPACIFIC') {
    if ((month === 0 && day >= 22) || (month === 1 && day <= 14)) {
      return { id: 'lunar_new_year', name: 'Lunar New Year', emoji: '🧧', surgeMultiplier: 1.50 };
    }
    if ((month === 3 && day >= 29) || (month === 4 && day <= 5)) {
      return { id: 'golden_week_jp', name: 'Japan Golden Week', emoji: '🌸', surgeMultiplier: 1.45 };
    }
  }

  // 4. Transatlantic Regional: European Summer Peak (Aug 1 - 18) & Oktoberfest (Late Sep - Early Oct)
  if (tier === 'TRANSATLANTIC') {
    if (month === 7 && day >= 1 && day <= 18) {
      return { id: 'euro_summer', name: 'European Summer (Ferragosto)', emoji: '🏖️', surgeMultiplier: 1.35 };
    }
    if ((month === 8 && day >= 20) || (month === 9 && day <= 6)) {
      return { id: 'oktoberfest', name: 'Oktoberfest Season', emoji: '🍺', surgeMultiplier: 1.25 };
    }
  }

  // 5. Canada Day / 4th of July Independence Week
  if (isCan && month === 6 && day >= 29 && day <= 3) {
    return { id: 'canada_day', name: 'Canada Day Long Weekend', emoji: '🍁', surgeMultiplier: 1.30 };
  }
  if (!isCan && month === 6 && day >= 1 && day <= 7) {
    return { id: 'july_fourth', name: '4th of July Weekend', emoji: '🎆', surgeMultiplier: 1.35 };
  }

  // 6. Spring Break Leisure Migration (March 10 - March 28)
  if (month === 2 && day >= 10 && day <= 28) {
    return { id: 'spring_break', name: 'Spring Break Migration', emoji: '🏖️', surgeMultiplier: 1.28 };
  }

  // 7. Easter Weekend (Late March - Mid April)
  if ((month === 2 && day >= 27) || (month === 3 && day <= 15)) {
    if (dayOfWeek === 5 || dayOfWeek === 0 || dayOfWeek === 1) {
      return { id: 'easter', name: 'Easter Holiday', emoji: '🐣', surgeMultiplier: 1.30 };
    }
  }

  // 8. Memorial Day / Juneteenth / Labor Day 3-Day Weekends
  if (month === 4 && day >= 23 && day <= 31 && (dayOfWeek === 5 || dayOfWeek === 1)) {
    return { id: 'memorial_day', name: 'Memorial Day Weekend', emoji: '🇺🇸', surgeMultiplier: 1.28 };
  }
  if (month === 5 && day >= 17 && day <= 21) {
    return { id: 'juneteenth', name: 'Juneteenth Weekend', emoji: '🌟', surgeMultiplier: 1.22 };
  }
  if (month === 8 && day >= 1 && day <= 8 && (dayOfWeek === 5 || dayOfWeek === 1)) {
    return { id: 'labor_day', name: 'Labor Day Weekend', emoji: '🎒', surgeMultiplier: 1.28 };
  }

  // 9. Winter Getaway / Super Bowl / Ski Weekend (Mid Feb)
  if (month === 1 && day >= 10 && day <= 20) {
    return { id: 'winter_ski', name: 'Presidents / Ski Weekend', emoji: '⛷️', surgeMultiplier: 1.25 };
  }

  // 10. Halloween (Late Oct)
  if (month === 9 && day >= 28 && day <= 31) {
    return { id: 'halloween', name: 'Halloween Weekend', emoji: '🎃', surgeMultiplier: 1.20 };
  }

  return null;
}

export interface AeroFluxOptions {
  volatilityEvent?: 'PRICE_WAR' | 'DEMAND_SURGE' | 'EQUILIBRIUM';
  seedBasePrice?: number;
}

export function generateAeroFluxTrajectory(
  route: {
    origin: string;
    dest: string;
    horizon: number;
    currency: CurrencyType;
    cabin: CabinClass;
    pax?: number | string;
    depDate?: string;
    excludeBasicEconomy?: boolean;
  },
  options: AeroFluxOptions = {}
): {
  dataPoints: number[];
  currentPrice: number;
  marketEventDescription?: string;
  holidayDays: (HolidayEvent | null)[];
} {
  const basePrice = options.seedBasePrice || calculateBaseRoutePrice(route.origin, route.dest, route.currency);
  const paxCount = Math.max(1, parseInt(String(route.pax || 1)) || 1);

  // Cabin multipliers
  const cabinMultipliers: Record<CabinClass, number> = {
    economy: 1.0,
    premium: 1.65,
    business: 3.2,
    first: 4.8,
  };
  const cabinFactor = cabinMultipliers[route.cabin] || 1.0;

  // Basic economy exclusion floor (+12% to guarantee main cabin carry-on)
  const carryOnBuffer = route.excludeBasicEconomy ? 1.12 : 1.0;

  // Base flight departure reference
  const startDate = route.depDate ? new Date(route.depDate) : new Date();
  if (isNaN(startDate.getTime())) {
    startDate.setTime(Date.now() + 25 * 86400000); // 25 days out fallback
  }

  // Market volatility event
  let marketEventMultiplier = 1.0;
  let marketEventDescription: string | undefined;

  const eventType = options.volatilityEvent || (Math.random() < 0.25 ? 'PRICE_WAR' : Math.random() < 0.4 ? 'DEMAND_SURGE' : 'EQUILIBRIUM');

  if (eventType === 'PRICE_WAR') {
    marketEventMultiplier = 0.82;
    marketEventDescription = 'Carrier Price War (-18% Market Dip)';
  } else if (eventType === 'DEMAND_SURGE') {
    marketEventMultiplier = 1.28;
    marketEventDescription = 'Peak Booking Demand Surge (+28%)';
  } else {
    marketEventMultiplier = 1.0;
    marketEventDescription = 'Steady Market Equilibrium';
  }

  const dataPoints: number[] = [];
  const holidayDays: (HolidayEvent | null)[] = [];

  for (let i = 0; i < route.horizon; i++) {
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + i);

    // Holiday detection
    const holiday = detectHolidayWindow(targetDate, route.origin, route.dest);
    holidayDays.push(holiday);
    const rawHolidayMultiplier = holiday ? holiday.surgeMultiplier : 1.0;

    const dow = targetDate.getDay();
    const daysUntilFlight = Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // Cabin-Specific Demand Profiles & Dynamic Curves
    let dowFactor = 1.0;
    let advanceCurve = 1.0;
    let effectiveHolidayMult = rawHolidayMultiplier;
    let stepNoise = 0;

    switch (route.cabin) {
      case 'economy':
        // Leisure U-Curve & Weekend Surges
        dowFactor = dow === 2 || dow === 3 ? 0.91 : dow === 5 || dow === 0 ? 1.18 : 1.0;
        advanceCurve =
          daysUntilFlight < 7
            ? 1.68 // Walk-up emergency spike
            : daysUntilFlight < 14
            ? 1.36
            : daysUntilFlight <= 45
            ? 0.88 // "The Golden Window" sweet spot
            : 1.04;
        effectiveHolidayMult = rawHolidayMultiplier; // Full leisure surge
        break;

      case 'premium':
        // Moderate hybrid: flatter DOW, moderate 14-day AP barrier
        dowFactor = dow === 5 ? 1.08 : dow === 2 ? 0.96 : 1.0;
        advanceCurve =
          daysUntilFlight < 7
            ? 1.45
            : daysUntilFlight < 14
            ? 1.25
            : daysUntilFlight <= 40
            ? 0.93
            : 1.02;
        effectiveHolidayMult = 1.0 + (rawHolidayMultiplier - 1.0) * 0.8;
        break;

      case 'business':
        // Corporate Road-Warrior: Inverted DOW (Mon/Thu high, Sat lowest)
        // Discrete Bucket-Step Pricing (Z -> D -> C -> J classes)
        dowFactor = dow === 1 || dow === 4 ? 1.16 : dow === 6 ? 0.86 : dow === 0 ? 0.94 : 1.02;
        advanceCurve =
          daysUntilFlight < 5
            ? 1.55 // Late corporate lock-in
            : daysUntilFlight < 14
            ? 1.30 // 14-day AP closeout
            : daysUntilFlight <= 30
            ? 1.0 // Flat corporate baseline
            : 0.96; // Early corporate discount
        effectiveHolidayMult = 1.0 + (rawHolidayMultiplier - 1.0) * 0.45;
        stepNoise = Math.floor(Math.sin(i * 0.6) * 2.5) * 25;
        break;

      case 'first':
        // Ultra-inelastic: flat plateau until final 3 days
        dowFactor = 1.0 + (dow === 5 ? 0.03 : dow === 2 ? -0.02 : 0.0);
        advanceCurve = daysUntilFlight < 4 ? 1.35 : daysUntilFlight < 10 ? 1.15 : 1.0;
        effectiveHolidayMult = 1.0 + (rawHolidayMultiplier - 1.0) * 0.35;
        break;
    }

    // Fluid micro-flux
    const microFlux = Math.sin(i * 0.75) * 12 + Math.cos(i * 1.2) * 8;

    const rawDayPrice =
      basePrice *
        cabinFactor *
        carryOnBuffer *
        dowFactor *
        advanceCurve *
        effectiveHolidayMult *
        marketEventMultiplier *
        (paxCount > 1 ? paxCount * 0.95 : 1) +
      microFlux +
      stepNoise;

    dataPoints.push(Math.round(Math.max(75, rawDayPrice)));
  }

  // Set current price (Outbound Anchor day)
  const currentPrice = dataPoints[0] || Math.round(basePrice * cabinFactor);

  return {
    dataPoints,
    currentPrice,
    marketEventDescription,
    holidayDays,
  };
}

// Generate realistic cabin-specific trajectory from an existing route
export function generateCabinSpecificTrajectory(route: Route, targetCabin: CabinClass): number[] {
  if (route.cabin === targetCabin) {
    return route.dataPoints;
  }

  const basePrice = calculateBaseRoutePrice(route.origin, route.dest, route.currency);
  const cabinMultipliers: Record<CabinClass, number> = {
    economy: 1.0,
    premium: 1.65,
    business: 3.2,
    first: 4.8,
  };
  const cabinFactor = cabinMultipliers[targetCabin] || 1.0;
  const carryOnBuffer = route.excludeBasicEconomy ? 1.12 : 1.0;

  const startDate = route.depDate ? new Date(route.depDate) : new Date();
  if (isNaN(startDate.getTime())) {
    startDate.setTime(Date.now() + 25 * 86400000);
  }

  const points: number[] = [];
  for (let i = 0; i < route.horizon; i++) {
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + i);

    const holiday = detectHolidayWindow(targetDate, route.origin, route.dest);
    const rawHolidayMultiplier = holiday ? holiday.surgeMultiplier : 1.0;

    const dow = targetDate.getDay();
    const daysUntilFlight = Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    let dowFactor = 1.0;
    let advanceCurve = 1.0;
    let effectiveHolidayMult = rawHolidayMultiplier;
    let stepNoise = 0;

    switch (targetCabin) {
      case 'economy':
        dowFactor = dow === 2 || dow === 3 ? 0.91 : dow === 5 || dow === 0 ? 1.18 : 1.0;
        advanceCurve =
          daysUntilFlight < 7
            ? 1.68
            : daysUntilFlight < 14
            ? 1.36
            : daysUntilFlight <= 45
            ? 0.88
            : 1.04;
        effectiveHolidayMult = rawHolidayMultiplier;
        break;

      case 'premium':
        dowFactor = dow === 5 ? 1.08 : dow === 2 ? 0.96 : 1.0;
        advanceCurve =
          daysUntilFlight < 7
            ? 1.45
            : daysUntilFlight < 14
            ? 1.25
            : daysUntilFlight <= 40
            ? 0.93
            : 1.02;
        effectiveHolidayMult = 1.0 + (rawHolidayMultiplier - 1.0) * 0.8;
        break;

      case 'business':
        dowFactor = dow === 1 || dow === 4 ? 1.16 : dow === 6 ? 0.86 : dow === 0 ? 0.94 : 1.02;
        advanceCurve =
          daysUntilFlight < 5
            ? 1.55
            : daysUntilFlight < 14
            ? 1.30
            : daysUntilFlight <= 30
            ? 1.0
            : 0.96;
        effectiveHolidayMult = 1.0 + (rawHolidayMultiplier - 1.0) * 0.45;
        stepNoise = Math.floor(Math.sin(i * 0.6) * 2.5) * 25;
        break;

      case 'first':
        dowFactor = 1.0 + (dow === 5 ? 0.03 : dow === 2 ? -0.02 : 0.0);
        advanceCurve = daysUntilFlight < 4 ? 1.35 : daysUntilFlight < 10 ? 1.15 : 1.0;
        effectiveHolidayMult = 1.0 + (rawHolidayMultiplier - 1.0) * 0.35;
        break;
    }

    const microFlux = Math.sin(i * 0.75) * 12 + Math.cos(i * 1.2) * 8;
    const rawDayPrice =
      basePrice *
        cabinFactor *
        carryOnBuffer *
        dowFactor *
        advanceCurve *
        effectiveHolidayMult +
      microFlux +
      stepNoise;

    points.push(Math.round(Math.max(75, rawDayPrice)));
  }

  return points;
}

// Pre-configured "Seed" Route for instant dev/QA testing
const seedToday = new Date();
const seedDep = new Date(seedToday.getTime() + 28 * 86400000).toISOString().split('T')[0];
const seedRet = new Date(seedToday.getTime() + 38 * 86400000).toISOString().split('T')[0];

const seedSim = generateAeroFluxTrajectory(
  {
    origin: 'SFO',
    dest: 'JFK',
    horizon: 14,
    currency: 'USD',
    cabin: 'economy',
    pax: 1,
    depDate: seedDep,
  },
  { volatilityEvent: 'PRICE_WAR', seedBasePrice: 380 }
);

const todayFormatted = new Date().toLocaleDateString('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: '2-digit',
});

export const SEED_ROUTE: Route = {
  id: 'rt_seed_transcon_sfo_jfk',
  tag: '🌱 Seed',
  origin: 'SFO',
  dest: 'JFK',
  currency: 'USD',
  horizon: 14,
  trackingDuration: 30,
  currentPrice: seedSim.currentPrice,
  dataPoints: seedSim.dataPoints,
  historyLog: [
    `${todayFormatted} : DL 412 ($${seedSim.currentPrice}.00 Genesis)`,
    `10/28/26 : UA 880 ($420.00 Initialized)`
  ],
  tripType: 'round-trip',
  depDate: seedDep,
  retDate: seedRet,
  pax: 1,
  cabin: 'economy',
  stopFilter: 'nonstop',
  preBuffer: 0,
  coreSpan: 14,
  postBuffer: 0,
  airlines: ['DL', 'UA', 'B6'],
  latestNote: 'Seed test route for AeroFlux surveillance QA',
  excludeBasicEconomy: true,
  timeOfDay: 'morning',
  targetFares: {
    economy: 350,
    premium: 580,
    business: 1100,
    first: 1650,
  },
  verifiedSpots: [
    {
      dayIndex: 0,
      price: seedSim.currentPrice,
      date: seedDep,
      carrier: 'DL 412',
      note: 'Verified genesis benchmark fare',
      leg: 'outbound',
    }
  ],
};

export const generateAeroCadabraTrajectory = generateAeroFluxTrajectory;

