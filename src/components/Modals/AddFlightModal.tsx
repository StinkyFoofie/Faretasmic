import React, { useState, useEffect } from 'react';
import {
  Route,
  CurrencyType,
  TripType,
  StopFilter,
  CabinClass,
  TimeOfDay,
  Airport,
} from '../../types';
import { APP_CONFIG, AIRPORT_DICTIONARY, AIRLINE_GROUPS } from '../../config';
import { generateAeroFluxTrajectory } from '../../engine/aeroflux';

interface AddFlightModalProps {
  isOpen: boolean;
  onAddRoute: (route: Route) => void;
  onValidationError: () => void;
  onClose: () => void;
}

export const AddFlightModal: React.FC<AddFlightModalProps> = ({
  isOpen,
  onAddRoute,
  onValidationError,
  onClose,
}) => {
  const [tripTag, setTripTag] = useState('');
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [trackingDuration, setTrackingDuration] = useState<number>(30);
  const [tripType, setTripType] = useState<TripType>('round-trip');
  const [stopFilter, setStopFilter] = useState<StopFilter>('nonstop');
  const [cabin, setCabin] = useState<CabinClass>(APP_CONFIG.DEFAULT_CABIN_CLASS);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');

  // Route Origin & Dest
  const [originInput, setOriginInput] = useState('SFO - San Francisco (SFO Int.)');
  const [destInput, setDestInput] = useState('');
  const [originMatches, setOriginMatches] = useState<Airport[]>([]);
  const [destMatches, setDestMatches] = useState<Airport[]>([]);
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);

  // Open-Jaw Return Origin & Dest
  const [returnOriginInput, setReturnOriginInput] = useState('');
  const [returnDestInput, setReturnDestInput] = useState('');
  const [returnOriginMatches, setReturnOriginMatches] = useState<Airport[]>([]);
  const [returnDestMatches, setReturnDestMatches] = useState<Airport[]>([]);
  const [showReturnOriginDrop, setShowReturnOriginDrop] = useState(false);
  const [showReturnDestDrop, setShowReturnDestDrop] = useState(false);

  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [depDate, setDepDate] = useState('');
  const [retDate, setRetDate] = useState('');

  const [preBuffer, setPreBuffer] = useState<number>(0);
  const [coreSpan, setCoreSpan] = useState<number>(14);
  const [postBuffer, setPostBuffer] = useState<number>(0);

  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [isAirlineDropOpen, setIsAirlineDropOpen] = useState(false);

  // Baggage & Trip Notes
  const [excludeBasicEconomy, setExcludeBasicEconomy] = useState(false);
  const [tripNotes, setTripNotes] = useState('');

  // Dropdown states for custom selects
  const [isTripTypeDropOpen, setIsTripTypeDropOpen] = useState(false);
  const [isStopFilterDropOpen, setIsStopFilterDropOpen] = useState(false);
  const [isCabinDropOpen, setIsCabinDropOpen] = useState(false);
  const [isTimeOfDayDropOpen, setIsTimeOfDayDropOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setTripTag('');
      setCurrency('USD');
      setTrackingDuration(30);
      setTripType('round-trip');
      setStopFilter('nonstop');
      setCabin(APP_CONFIG.DEFAULT_CABIN_CLASS);
      setTimeOfDay('anytime');
      setOriginInput('SFO - San Francisco (SFO Int.)');
      setDestInput('');
      setReturnOriginInput('');
      setReturnDestInput('');
      setPassengerCount(1);
      setDepDate('');
      setRetDate('');
      setPreBuffer(0);
      setCoreSpan(14);
      setPostBuffer(0);
      setSelectedAirlines([]);
      setExcludeBasicEconomy(false);
      setTripNotes('');
      setShowOriginDrop(false);
      setShowDestDrop(false);
      setShowReturnOriginDrop(false);
      setShowReturnDestDrop(false);
      setIsAirlineDropOpen(false);
      setIsTripTypeDropOpen(false);
      setIsStopFilterDropOpen(false);
      setIsCabinDropOpen(false);
      setIsTimeOfDayDropOpen(false);
    }
  }, [isOpen]);

  // Handle currency change
  const handleCurrencyChange = (curr: CurrencyType) => {
    setCurrency(curr);
    if (curr === 'USD') {
      setOriginInput('SFO - San Francisco (SFO Int.)');
    } else {
      setOriginInput('YYZ - Toronto (Pearson Int.)');
    }
  };

  // Calculate coreSpan whenever departure or return date changes
  useEffect(() => {
    if (tripType === 'one-way') {
      setCoreSpan(14);
      return;
    }
    if (depDate && retDate) {
      const d1 = new Date(depDate);
      const d2 = new Date(retDate);
      let diff = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 1) diff = 1;
      setCoreSpan(diff);
    } else {
      setCoreSpan(14);
    }
  }, [depDate, retDate, tripType]);

  const totalSweep = (preBuffer || 0) + (coreSpan || 14) + (postBuffer || 0);

  // Autocomplete helpers
  const filterAirports = (val: string) => {
    const upper = val.toUpperCase().trim();
    if (!upper) return [];
    return AIRPORT_DICTIONARY.filter(
      (a) =>
        a.iata.includes(upper) ||
        a.city.toUpperCase().includes(upper) ||
        a.name.toUpperCase().includes(upper)
    );
  };

  const handleOriginChange = (val: string) => {
    setOriginInput(val);
    const matches = filterAirports(val);
    setOriginMatches(matches);
    setShowOriginDrop(matches.length > 0);
  };

  const handleDestChange = (val: string) => {
    setDestInput(val);
    const matches = filterAirports(val);
    setDestMatches(matches);
    setShowDestDrop(matches.length > 0);
  };

  const handleReturnOriginChange = (val: string) => {
    setReturnOriginInput(val);
    const matches = filterAirports(val);
    setReturnOriginMatches(matches);
    setShowReturnOriginDrop(matches.length > 0);
  };

  const handleReturnDestChange = (val: string) => {
    setReturnDestInput(val);
    const matches = filterAirports(val);
    setReturnDestMatches(matches);
    setShowReturnDestDrop(matches.length > 0);
  };

  const handleAddAirline = (code: string) => {
    if (!code || selectedAirlines.includes(code)) return;
    setSelectedAirlines([...selectedAirlines, code]);
    setIsAirlineDropOpen(false);
  };

  const handleRemoveAirline = (code: string) => {
    setSelectedAirlines(selectedAirlines.filter((c) => c !== code));
  };

  const handleSubmit = () => {
    const originRaw = originInput.trim();
    const destRaw = destInput.trim();
    const origin = originRaw.slice(0, 3).toUpperCase();
    const dest = destRaw.slice(0, 3).toUpperCase();

    if (!origin || !dest || origin.length !== 3 || dest.length !== 3) {
      onValidationError();
      return;
    }

    if (depDate && depDate < todayStr) {
      onValidationError();
      return;
    }

    if (tripType !== 'one-way' && depDate && retDate && retDate < depDate) {
      onValidationError();
      return;
    }

    const returnOrigin = tripType === 'open-jaw' && returnOriginInput.trim()
      ? returnOriginInput.trim().slice(0, 3).toUpperCase()
      : undefined;
    const returnDest = tripType === 'open-jaw' && returnDestInput.trim()
      ? returnDestInput.trim().slice(0, 3).toUpperCase()
      : undefined;

    const horizon = totalSweep || 14;

    const aeroSim = generateAeroFluxTrajectory({
      origin,
      dest,
      horizon,
      currency,
      cabin,
      pax: passengerCount,
      depDate,
    });

    const dateTodayFormatted = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });

    const initialCarrier = selectedAirlines.length > 0 ? `${selectedAirlines[0]} 101` : 'DL 412';

    // Calculate smart initial target for selected cabin (25th percentile)
    const sortedPrices = [...aeroSim.dataPoints].sort((a, b) => a - b);
    const p25Index = Math.floor(sortedPrices.length * 0.25);
    const autoTarget = sortedPrices[p25Index] || aeroSim.currentPrice;

    const newRoute: Route = {
      id: 'rt_' + Date.now(),
      tag: tripTag.trim() || 'Untagged Trip',
      origin,
      dest,
      returnOrigin,
      returnDest,
      currency,
      horizon,
      trackingDuration: trackingDuration || 30,
      currentPrice: aeroSim.currentPrice,
      dataPoints: aeroSim.dataPoints,
      historyLog: [`${dateTodayFormatted} : ${initialCarrier} ($${aeroSim.currentPrice}.00 Genesis)`],
      tripType,
      depDate,
      retDate: tripType === 'one-way' ? '' : retDate,
      pax: passengerCount,
      cabin,
      stopFilter,
      timeOfDay,
      excludeBasicEconomy,
      preBuffer,
      coreSpan,
      postBuffer,
      airlines: selectedAirlines,
      targetFares: {
        [cabin]: autoTarget,
      },
      latestNote: `Initialized via AeroFlux (${aeroSim.marketEventDescription || 'Market Baseline'})`,
      notes: tripNotes.trim() || undefined,
      verifiedSpots: [
        {
          dayIndex: 0,
          price: aeroSim.currentPrice,
          date: depDate || dateTodayFormatted,
          carrier: initialCarrier,
          note: 'Genesis Outbound Anchor',
          leg: 'outbound',
        },
      ],
    };

    onAddRoute(newRoute);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" id="modal-add-flight" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <span style={{ flex: 1, textAlign: 'center' }}>✈️ ADD POOH 🚀</span>
          <button
            className="secondary-btn"
            style={{
              position: 'absolute',
              right: '15px',
              width: '32px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Row 1: Trip Tag */}
          <div className="form-group">
            <label>TRIP NAME</label>
            <input
              type="text"
              className="form-control"
              id="input-trip-tag"
              value={tripTag}
              onChange={(e) => setTripTag(e.target.value)}
              placeholder={APP_CONFIG.PLACEHOLDER_TRIP_NAME}
            />
          </div>

          {/* Row 2: Currency & Tracking Duration */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>BASE CURRENCY (⚠️ CANNOT BE CHANGED LATER)</label>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '6px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                    textTransform: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="input-currency-selection"
                    value="USD"
                    checked={currency === 'USD'}
                    onChange={() => handleCurrencyChange('USD')}
                  />{' '}
                  USD ($)
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                    textTransform: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="input-currency-selection"
                    value="CAD"
                    checked={currency === 'CAD'}
                    onChange={() => handleCurrencyChange('CAD')}
                  />{' '}
                  CAD ($)
                </label>
              </div>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>TRACKING DURATION (DAYS)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  className="form-control"
                  id="input-tracking-duration"
                  min={1}
                  max={999}
                  value={trackingDuration}
                  onChange={(e) => setTrackingDuration(parseInt(e.target.value) || 1)}
                  style={{ maxWidth: '100px' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  (Max 999 Days)
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Trip Type & Junk Fare Filter */}
          <div className="form-row">
            <div className="form-group">
              <label>TRIP TYPE</label>
              <div
                className={`custom-select ${isTripTypeDropOpen ? 'open' : ''}`}
                id="cs-trip-type"
              >
                <div
                  className="custom-select-trigger"
                  onClick={() => setIsTripTypeDropOpen(!isTripTypeDropOpen)}
                >
                  <span className="c-text">
                    {tripType === 'round-trip'
                      ? 'Round-Trip'
                      : tripType === 'one-way'
                      ? 'One-Way'
                      : 'Open-Jaw (Split Airports)'}
                  </span>
                  <span className="c-arrow">▼</span>
                </div>
                {isTripTypeDropOpen && (
                  <div className="custom-select-options" style={{ display: 'block', zIndex: 100 }}>
                    <div
                      className={`custom-option ${tripType === 'round-trip' ? 'selected' : ''}`}
                      onClick={() => {
                        setTripType('round-trip');
                        setIsTripTypeDropOpen(false);
                      }}
                    >
                      Round-Trip
                    </div>
                    <div
                      className={`custom-option ${tripType === 'one-way' ? 'selected' : ''}`}
                      onClick={() => {
                        setTripType('one-way');
                        setRetDate('');
                        setIsTripTypeDropOpen(false);
                      }}
                    >
                      One-Way
                    </div>
                    <div
                      className={`custom-option ${tripType === 'open-jaw' ? 'selected' : ''}`}
                      onClick={() => {
                        setTripType('open-jaw');
                        setIsTripTypeDropOpen(false);
                      }}
                    >
                      Open-Jaw (Split Airports)
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>JUNK FARE FILTER</label>
              <div
                className={`custom-select ${isStopFilterDropOpen ? 'open' : ''}`}
                id="cs-stop-filter"
              >
                <div
                  className="custom-select-trigger"
                  onClick={() => setIsStopFilterDropOpen(!isStopFilterDropOpen)}
                >
                  <span className="c-text">
                    {stopFilter === 'nonstop'
                      ? 'Nonstop Only'
                      : stopFilter === '1stop'
                      ? 'Max 1 Stop'
                      : 'Any Stops'}
                  </span>
                  <span className="c-arrow">▼</span>
                </div>
                {isStopFilterDropOpen && (
                  <div className="custom-select-options" style={{ display: 'block', zIndex: 100 }}>
                    <div
                      className={`custom-option ${stopFilter === 'nonstop' ? 'selected' : ''}`}
                      onClick={() => {
                        setStopFilter('nonstop');
                        setIsStopFilterDropOpen(false);
                      }}
                    >
                      Nonstop Only
                    </div>
                    <div
                      className={`custom-option ${stopFilter === '1stop' ? 'selected' : ''}`}
                      onClick={() => {
                        setStopFilter('1stop');
                        setIsStopFilterDropOpen(false);
                      }}
                    >
                      Max 1 Stop
                    </div>
                    <div
                      className={`custom-option ${stopFilter === 'any' ? 'selected' : ''}`}
                      onClick={() => {
                        setStopFilter('any');
                        setIsStopFilterDropOpen(false);
                      }}
                    >
                      Any Stops
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Origin & Destination */}
          <div className="form-row">
            <div className="form-group">
              <label>ORIGIN (IATA)</label>
              <input
                type="text"
                className="form-control iata-input"
                id="input-origin-iata"
                maxLength={60}
                autoComplete="off"
                value={originInput}
                onChange={(e) => handleOriginChange(e.target.value)}
                onFocus={() => {
                  if (originMatches.length > 0) setShowOriginDrop(true);
                }}
              />
              {showOriginDrop && originMatches.length > 0 && (
                <div className="autocomplete-dropdown" style={{ display: 'block' }}>
                  {originMatches.map((m) => (
                    <div
                      key={m.iata}
                      className="autocomplete-item"
                      onClick={() => {
                        setOriginInput(`${m.iata} - ${m.city} (${m.name})`);
                        setShowOriginDrop(false);
                      }}
                    >
                      {m.iata} - {m.city} ({m.name})
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>DESTINATION (IATA)</label>
              <input
                type="text"
                className="form-control iata-input"
                id="input-dest-iata"
                maxLength={60}
                autoComplete="off"
                placeholder={APP_CONFIG.PLACEHOLDER_DESTINATION_IATA}
                value={destInput}
                onChange={(e) => handleDestChange(e.target.value)}
                onFocus={() => {
                  if (destMatches.length > 0) setShowDestDrop(true);
                }}
              />
              {showDestDrop && destMatches.length > 0 && (
                <div className="autocomplete-dropdown" style={{ display: 'block' }}>
                  {destMatches.map((m) => (
                    <div
                      key={m.iata}
                      className="autocomplete-item"
                      onClick={() => {
                        setDestInput(`${m.iata} - ${m.city} (${m.name})`);
                        setShowDestDrop(false);
                      }}
                    >
                      {m.iata} - {m.city} ({m.name})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional Open-Jaw Return Airport Row */}
          {tripType === 'open-jaw' && (
            <div
              className="form-row open-jaw-container"
              style={{
                background: 'var(--bg-input)',
                padding: '10px',
                borderRadius: 'var(--radius)',
                border: '1px dashed var(--accent)',
              }}
            >
              <div className="form-group">
                <label style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                  🔀 RETURN ORIGIN (IATA)
                </label>
                <input
                  type="text"
                  className="form-control iata-input"
                  id="input-return-origin-iata"
                  maxLength={60}
                  autoComplete="off"
                  placeholder="e.g. HND - Tokyo"
                  value={returnOriginInput}
                  onChange={(e) => handleReturnOriginChange(e.target.value)}
                  onFocus={() => {
                    if (returnOriginMatches.length > 0) setShowReturnOriginDrop(true);
                  }}
                />
                {showReturnOriginDrop && returnOriginMatches.length > 0 && (
                  <div className="autocomplete-dropdown" style={{ display: 'block' }}>
                    {returnOriginMatches.map((m) => (
                      <div
                        key={m.iata}
                        className="autocomplete-item"
                        onClick={() => {
                          setReturnOriginInput(`${m.iata} - ${m.city} (${m.name})`);
                          setShowReturnOriginDrop(false);
                        }}
                      >
                        {m.iata} - {m.city} ({m.name})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                  🔀 RETURN DESTINATION (IATA)
                </label>
                <input
                  type="text"
                  className="form-control iata-input"
                  id="input-return-dest-iata"
                  maxLength={60}
                  autoComplete="off"
                  placeholder="e.g. OAK - Oakland"
                  value={returnDestInput}
                  onChange={(e) => handleReturnDestChange(e.target.value)}
                  onFocus={() => {
                    if (returnDestMatches.length > 0) setShowReturnDestDrop(true);
                  }}
                />
                {showReturnDestDrop && returnDestMatches.length > 0 && (
                  <div className="autocomplete-dropdown" style={{ display: 'block' }}>
                    {returnDestMatches.map((m) => (
                      <div
                        key={m.iata}
                        className="autocomplete-item"
                        onClick={() => {
                          setReturnDestInput(`${m.iata} - ${m.city} (${m.name})`);
                          setShowReturnDestDrop(false);
                        }}
                      >
                        {m.iata} - {m.city} ({m.name})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Row 5: Passengers & Cabin Class */}
          <div className="form-row">
            <div className="form-group">
              <label>PASSENGERS (1-10)</label>
              <input
                type="number"
                className="form-control"
                id="input-passenger-count"
                min={1}
                max={10}
                value={passengerCount}
                onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="form-group">
              <label>CABIN CLASS</label>
              <div
                className={`custom-select ${isCabinDropOpen ? 'open' : ''}`}
                id="cs-cabin-class"
              >
                <div
                  className="custom-select-trigger"
                  onClick={() => setIsCabinDropOpen(!isCabinDropOpen)}
                >
                  <span className="c-text">
                    {cabin === 'economy'
                      ? 'Economy'
                      : cabin === 'premium'
                      ? 'Premium Economy'
                      : cabin === 'business'
                      ? 'Business'
                      : 'First'}
                  </span>
                  <span className="c-arrow">▼</span>
                </div>
                {isCabinDropOpen && (
                  <div className="custom-select-options" style={{ display: 'block', zIndex: 100 }}>
                    <div
                      className={`custom-option ${cabin === 'economy' ? 'selected' : ''}`}
                      onClick={() => {
                        setCabin('economy');
                        setIsCabinDropOpen(false);
                      }}
                    >
                      Economy
                    </div>
                    <div
                      className={`custom-option ${cabin === 'premium' ? 'selected' : ''}`}
                      onClick={() => {
                        setCabin('premium');
                        setIsCabinDropOpen(false);
                      }}
                    >
                      Premium Economy
                    </div>
                    <div
                      className={`custom-option ${cabin === 'business' ? 'selected' : ''}`}
                      onClick={() => {
                        setCabin('business');
                        setIsCabinDropOpen(false);
                      }}
                    >
                      Business
                    </div>
                    <div
                      className={`custom-option ${cabin === 'first' ? 'selected' : ''}`}
                      onClick={() => {
                        setCabin('first');
                        setIsCabinDropOpen(false);
                      }}
                    >
                      First
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 6: Preferred Departure Time Window */}
          <div className="form-group">
            <label>⏰ PREFERRED DEPARTURE TIME WINDOW</label>
            <div
              className={`custom-select ${isTimeOfDayDropOpen ? 'open' : ''}`}
              id="cs-time-of-day"
            >
              <div
                className="custom-select-trigger"
                onClick={() => setIsTimeOfDayDropOpen(!isTimeOfDayDropOpen)}
              >
                <span className="c-text">
                  {timeOfDay === 'anytime'
                    ? 'Anytime (All Day)'
                    : timeOfDay === 'morning'
                    ? 'Morning (06:00 - 12:00)'
                    : timeOfDay === 'afternoon'
                    ? 'Afternoon (12:00 - 18:00)'
                    : 'Evening / Redeye (18:00+)'}
                </span>
                <span className="c-arrow">▼</span>
              </div>
              {isTimeOfDayDropOpen && (
                <div className="custom-select-options" style={{ display: 'block', zIndex: 100 }}>
                  <div
                    className={`custom-option ${timeOfDay === 'anytime' ? 'selected' : ''}`}
                    onClick={() => {
                      setTimeOfDay('anytime');
                      setIsTimeOfDayDropOpen(false);
                    }}
                  >
                    Anytime (All Day)
                  </div>
                  <div
                    className={`custom-option ${timeOfDay === 'morning' ? 'selected' : ''}`}
                    onClick={() => {
                      setTimeOfDay('morning');
                      setIsTimeOfDayDropOpen(false);
                    }}
                  >
                    Morning (06:00 - 12:00)
                  </div>
                  <div
                    className={`custom-option ${timeOfDay === 'afternoon' ? 'selected' : ''}`}
                    onClick={() => {
                      setTimeOfDay('afternoon');
                      setIsTimeOfDayDropOpen(false);
                    }}
                  >
                    Afternoon (12:00 - 18:00)
                  </div>
                  <div
                    className={`custom-option ${timeOfDay === 'evening' ? 'selected' : ''}`}
                    onClick={() => {
                      setTimeOfDay('evening');
                      setIsTimeOfDayDropOpen(false);
                    }}
                  >
                    Evening / Redeye (18:00+)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 7: Departure & Return Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>DEPARTURE DATE</label>
              <input
                type="date"
                className="form-control"
                id="input-departure-date"
                min={todayStr}
                value={depDate}
                onChange={(e) => {
                  setDepDate(e.target.value);
                  if (retDate && retDate < e.target.value) {
                    setRetDate(e.target.value);
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label>RETURN DATE</label>
              <input
                type="date"
                className="form-control"
                id="input-return-date"
                disabled={tripType === 'one-way'}
                min={depDate || todayStr}
                value={retDate}
                onChange={(e) => setRetDate(e.target.value)}
              />
            </div>
          </div>

          {/* Row 8: Genesis Sweep Horizon */}
          <div className="form-group">
            <label>GENESIS SWEEP HORIZON (Day 1 Fetch Modeling)</label>
            <div className="form-row" style={{ marginTop: '4px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '10px' }}>PRE-DEPARTURE BUFFER</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="number"
                    className="form-control"
                    id="input-sweep-buffer-pre"
                    min={0}
                    max={30}
                    value={preBuffer}
                    onChange={(e) => setPreBuffer(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '10px' }}>CORE ANCHOR SPAN</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-control"
                    id="input-sweep-core-span"
                    value={coreSpan}
                    disabled
                    style={{
                      background: 'var(--bg-surface)',
                      opacity: 0.7,
                      color: 'var(--text-main)',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '10px' }}>POST-RETURN BUFFER</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="number"
                    className="form-control"
                    id="input-sweep-buffer-post"
                    min={0}
                    max={30}
                    value={postBuffer}
                    onChange={(e) => setPostBuffer(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: '6px',
                textAlign: 'center',
              }}
            >
              Total Initial Sweep:{' '}
              <strong id="ui-sweep-total-val" style={{ color: 'var(--accent)' }}>
                {totalSweep}
              </strong>{' '}
              Calls • Daily Surveillance Thereafter: 2 Calls / Day
            </div>
          </div>

          {/* Row 9: Target Airlines */}
          <div className="form-group">
            <label>TARGET AIRLINES (Multi-Select)</label>
            <div className="form-row" style={{ alignItems: 'center' }}>
              <div
                className={`custom-select ${isAirlineDropOpen ? 'open' : ''}`}
                id="cs-add-airline"
                style={{ flex: '0 0 160px', maxWidth: '160px' }}
              >
                <div
                  className="custom-select-trigger"
                  onClick={() => setIsAirlineDropOpen(!isAirlineDropOpen)}
                >
                  <span className="c-text" id="ui-opt-add-carrier">
                    {APP_CONFIG.PLACEHOLDER_ADD_CARRIER}
                  </span>
                  <span className="c-arrow">▼</span>
                </div>
                {isAirlineDropOpen && (
                  <div
                    className="custom-select-options"
                    id="cs-options-airline"
                    style={{ display: 'block', zIndex: 100 }}
                  >
                    {Object.entries(AIRLINE_GROUPS).map(([region, airlines]) => (
                      <React.Fragment key={region}>
                        <div className="custom-optgroup">{region}</div>
                        {airlines.map((air) => {
                          const isAlreadyAdded = selectedAirlines.includes(air.code);
                          return (
                            <div
                              key={air.code}
                              className={`custom-option ${isAlreadyAdded ? 'disabled' : ''}`}
                              onClick={() => {
                                if (!isAlreadyAdded) handleAddAirline(air.code);
                              }}
                            >
                              {air.name}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="pill-container"
                id="container-airline-tags"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  minHeight: 0,
                }}
              >
                {selectedAirlines.map((code) => (
                  <div key={code} className="airline-pill" data-code={code}>
                    {code}{' '}
                    <span onClick={() => handleRemoveAirline(code)}>✕</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 10: Exclude Basic Economy Toggle (Below Target Airlines) */}
          <div
            className="form-group"
            style={{
              padding: '10px 12px',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                textTransform: 'none',
                color: 'var(--text-main)',
                fontSize: '13px',
                margin: 0,
              }}
            >
              <input
                type="checkbox"
                id="input-exclude-basic-economy"
                checked={excludeBasicEconomy}
                onChange={(e) => setExcludeBasicEconomy(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>
                🧳 <strong>Exclude Basic Economy</strong> (Guaranteed overhead carry-on bag included)
              </span>
            </label>
          </div>

          {/* Row 11: Trip Notes (At bottom of modal) */}
          <div className="form-group">
            <label>📝 TRIP NOTES (Optional)</label>
            <textarea
              className="form-control"
              id="input-trip-notes"
              rows={2}
              style={{ height: 'auto', minHeight: '56px', resize: 'vertical' }}
              placeholder="e.g. Look for lie-flat business class or Star Alliance redemption sweet spots"
              value={tripNotes}
              onChange={(e) => setTripNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            CANCEL
          </button>
          <button
            className="primary-btn"
            id="ui-btn-start-tracking"
            onClick={handleSubmit}
          >
            {APP_CONFIG.BTN_START_TRACKING}
          </button>
        </div>
      </div>
    </div>
  );
};
