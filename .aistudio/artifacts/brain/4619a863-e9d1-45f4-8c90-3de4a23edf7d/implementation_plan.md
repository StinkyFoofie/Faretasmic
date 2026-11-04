# 🪄 Faretasmic — Disney Intelligence Suite, BRUNOPHESY Engine & UI Precision

A complete, production-grade architectural blueprint detailing the transformation of Faretasmic into a Disney-themed flight intelligence station. This plan covers the 8-Theme Disney Suite (4 Dark / 4 Light), the Disney nomenclature overhaul (`AeroCadabra`, `BRUNOPHESY`, `Zurgulate`, `TIKIMETRY`, `POOHTRAX`, `ADD POOH`), the inverted speedometer dial with dynamic contrast pill, price spectrum needle alignment, single-row Zurgulate badge, and decoupled dropdown text centering with universal outside-click dismissal.

---

### User Directives & Approved Specifications

> [!IMPORTANT]
> All specifications have been vetted and approved by the Product Architect. This plan guarantees zero regression to existing chart interactivity, real-time calculations, or DOM styling while executing all requested Disney thematic enhancements.

1. **Speedometer Confidence Dial Inversion**:
   - `0% – 50%`: Red (`var(--danger)` / `#ef4444`) — low statistical conviction / high market volatility.
   - `51% – 75%`: Amber/Yellow (`var(--warning)` / `#f59e0b`) — moderate conviction / transitional pricing.
   - `76% – 100%`: Green (`var(--success)` / `#10b981`) — high conviction / optimal buy window.
   - **Orbiting % Pill**: Background and border dynamically match the active range color. Text switches to dark slate (`#18181b`) on yellow for optimal optical contrast, and crisp white (`#ffffff`) on red/green.
2. **BRUNOPHESY Predictive Readout Engine**:
   - Deterministic client-side rules engine evaluating real-time price variance against 14-day baseline, advance booking cliffs (14/21-day jumps), and weekend/holiday surcharges.
   - Dynamic action badges: `BUY NOW`, `WAIT & TRACK`, `BOOK IMMEDIATELY`.
   - Lore-infused contextual reasoning (*"We don't talk about Bruno, but we talk about flight forecasts"*).
3. **Disney Nomenclature Transformation**:
   - Core Simulation Engine: **`AeroCadabra`** (formerly AeroFlux).
   - Predictive Oracle Engine: **`BRUNOPHESY`** (Encanto homage).
   - Target Fare Surveillance: **`Zurgulate`** (Emperor Zurg + triangulate).
   - 14-Day Price Trajectory: **`TIKIMETRY`** (Enchanted Tiki Room + telemetry).
   - Active Flight Monitors: **`POOHTRAX`** (Winnie the Pooh + flight tracks).
   - Primary Action Button: **`ADD POOH`** (formerly "Add Flight").
4. **8 Disney Themes Suite (4 Dark / 4 Light)** replacing all 9 legacy themes:
   - **Dark (4)**: `fantasmic-sorcerer` (Hero default), `tomorrowland-tron`, `haunted-mansion`, `forbidden-mountain`.
   - **Light (4)**: `main-street-sunshine`, `cinderella-castle`, `neverland-skies`, `epcot-spaceship-earth`.
5. **Historical Price Spectrum Gauge Needle Design**:
   - Target marker (`#ui-gauge-target-pin`) updated to share the exact same physical line geometry as the main price needle (`#ui-gauge-needle`): 3px width $\times$ 48px height cutting through the spectrum bar, with the `🎯` emoji centered directly above.
6. **Zurgulate Hit Badge Word-Wrap Fix**:
   - Force single-row layout (`white-space: nowrap; flex-shrink: 0;`) on the `🎯 HIT (-$XX USD)` pill to eliminate awkward word-wrapping on compact column viewports.
7. **Chart Dropdowns Interaction & Alignment**:
   - `#cs-chart-format` (Bar/Line graph): Triangle arrow right-aligned (`position: absolute; right: 10px;`), text true center-aligned across the full button width.
   - `#cs-chart-cabin-switcher` (Plot cabin): Text true center-aligned edge-to-edge across the button, ignoring the right-pinned triangle arrow.
   - **Universal Outside-Click Dismissal (`useOutsideClick`)**: Custom dropdown menus across the entire application auto-close when clicking outside.
8. **Dynamic `<meta name="theme-color">` Sync**:
   - Browser navigation bar and chrome match the active Disney theme background seamlessly.

---

### 1. Visual & Spatial Architecture

#### Left Column: BRUNOPHESY Cockpit & Zurgulate
```
┌─────────────────────────────────────────────────────────────┐
│ 🔮 BRUNOPHESY                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ╭───────────╮                            │
│     [0-50%: RED] ╱   \       /   ╲ [76-100%: GREEN]         │
│                 │     \  ▲  /     │  ◄── Inverted Dial      │
│                 │      \ │ /      │                         │
│                  ╲     ╭─┴─╮     ╱                          │
│                    ╰───┤92%├───╯   ◄── Green Pill (Matches) │
│                     CONFIDENCE                              │
│                                                             │
│  RECOMMENDATION:                                            │
│  📉 BUY NOW: -14% vs 14-DAY BASELINE                        │
│  "AeroCadabra confirms pricing trough ($340). Advance cliff │
│   triggers a +$85 spike within 6 days."                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  HISTORICAL PRICE SPECTRUM GAUGE                            │
│  ┌───────────────────────┬───────────────────┬────────────┐ │
│  │ LOW: $310             │ TYPICAL           │ HIGH: $580 │ │
│  └───────────────────────┴───────────────────┴────────────┘ │
│         │ (Needle: $340)       │ (🎯 Target: $360)          │
│         │ (3px x 48px line)    │ (3px x 48px line + 🎯 top) │
├─────────────────────────────────────────────────────────────┤
│ 🎯 Zurgulate                  [🎯 HIT (-$20 USD)] (1-Row)  │
│  CABIN CLASS                  TARGET FARE ($)               │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │ 💺 Economy            ▼ │  │ $ 350.00  [🎯 Auto-Set]   │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Right Column: 14-Day TIKIMETRY with Decoupled Dropdown Centering
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 14-DAY TIKIMETRY                      [    💺 Economy    ▼ ]   [    📊 Bar Graph    ▼ ]│
│                                            (True Center) (Right)    (True Center) (Right)│
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                                           🦃 ◄── Floating Holiday Pin                  │
│               📌 ◄── Verified Spot        │                                            │
│  - - - - - - -│ - - - - - - - - - - - - - - - - - - - 🎯 Target: $350 - - - - - - - - │
│   [Bar 1]   [Bar 2]   [Bar 3]   [Bar 4]   ▼[Bar 5]   [Bar 6]                           │
│   Anchor                                  Holiday                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. The 8 Disney Themes Palette Matrix

| Theme ID | Category | Mood & Narrative | Primary Tokens (`--bg-main`, `--accent`, `--text-main`) |
| :--- | :--- | :--- | :--- |
| **`fantasmic-sorcerer`** *(Hero)* | Dark | Deep midnight blue-purple, Sorcerer sapphire, star gold glow | `#0b081a`, `#7c3aed`, `#f5f3ff` |
| **`tomorrowland-tron`** | Dark | Obsidian grid, electric neon cyan, laser circuit blue | `#060d17`, `#06b6d4`, `#e0f2fe` |
| **`haunted-mansion`** | Dark | Spectral slate teal, eerie candlelight amber, phantom green | `#0d1514`, `#10b981`, `#e6f4f1` |
| **`forbidden-mountain`** | Dark | Himalayan dark stone, blizzard ice blue, lantern warm amber | `#111418`, `#38bdf8`, `#f0f9ff` |
| **`main-street-sunshine`** | Light | Warm Victorian cream, gaslight gold, festive brick red | `#fffdf7`, `#d97706`, `#292524` |
| **`cinderella-castle`** | Light | Royal sky blue, pearlescent silver, fairytale gold trim | `#f4f8ff`, `#2563eb`, `#1e293b` |
| **`neverland-skies`** | Light | Daybreak cloud white, pastel lavender, pixie dust gold | `#faf7ff`, `#8b5cf6`, `#332d42` |
| **`epcot-spaceship-earth`** | Light | Geodesic silver-white, future horizon cobalt | `#f8fafc`, `#0284c7`, `#0f172a` |

---

### 3. Step-by-Step Implementation Schedule

1. **Step 1: Core Type Definitions & Configuration**
   - File: `src/types.ts`
     - Export the 8 `ThemeId` union literals (`fantasmic-sorcerer`, `tomorrowland-tron`, etc.).
   - File: `src/config.ts`
     - Update button labels: `BTN_ADD_FLIGHT_MAIN: "ADD POOH"`, `BTN_ADD_FLIGHT_EMPTY: "ADD POOH"`.
     - Update simulation engine copy to `AeroCadabra`.
     - Register the 8 Disney themes in `THEMES_LIST` with their respective icons, names, and light/dark classifications.

2. **Step 2: Simulation Engine (`AeroCadabra`)**
   - File: `src/engine/aeroflux.ts`
     - Rename engine methods and toast messages to reflect `AeroCadabra`.
     - Maintain existing deterministic Monte Carlo calculations for smooth baseline transitions.

3. **Step 3: Universal CSS & Dropdown Centering**
   - File: `src/index.css`
     - Replace legacy theme CSS attribute selectors with the 8 Disney themes.
     - Add `.custom-select-trigger-centered` utility ensuring:
       - `.c-text`: `display: block; width: 100%; text-align: center;`
       - `.c-arrow`: `position: absolute; right: 10px; top: 50%; transform: translateY(-50%);`

4. **Step 4: BRUNOPHESY Predictive Oracle Panel**
   - File: `src/components/OraclePanel.tsx`
     - Rename header to `🔮 BRUNOPHESY`.
     - Invert dial gradient: 0–50% red, 51–75% amber, 76–100% green.
     - Dynamic orbiting pill: matching background and border, with `#18181b` dark text for amber and `#ffffff` for red/green.
     - Align `#ui-gauge-target-pin` to matching 3px $\times$ 48px needle line through the spectrum bar, with `🎯` emoji centered directly above.

5. **Step 5: Zurgulate Target Surveillance**
   - File: `src/components/TargetSurveillanceBox.tsx`
     - Rename header to `🎯 Zurgulate`.
     - Prevent word wrapping on the hit badge pill (`whiteSpace: 'nowrap'`, `flexShrink: 0`).
     - Wire outside-click closing to the cabin select dropdown.

6. **Step 6: 14-Day TIKIMETRY Chart**
   - File: `src/components/PriceChart.tsx`
     - Update header title to `14-Day TIKIMETRY`.
     - Apply decoupled centering to format switcher (`#cs-chart-format`) and cabin selector (`#cs-chart-cabin-switcher`).
     - Wire outside-click closing via `useOutsideClick`.

7. **Step 7: POOHTRAX Flight Monitors & Header**
   - Files: `src/components/FlightList.tsx`, `src/components/Header.tsx`, `src/components/Modals/ThemeModal.tsx`
     - Update flight list header to `✈️ POOHTRAX`.
     - Update primary action buttons to `ADD POOH`.
     - Implement dynamic `<meta name="theme-color">` synchronization upon theme activation.
     - Implement outside-click dismissal on the theme selector dropdown.

8. **Step 8: Turnkey Verification**
   - Run `compile_applet` and `lint_applet` to verify zero TypeScript errors, clean bundle compilation, and flawless runtime rendering.

---

### 📋 Engineer’s Proposals & Architectural Dependencies

> [!NOTE]
> All 3 proposals below have been reviewed and approved by the Product Architect for inclusion in this build:

1. **Approved Proposal 1: Lore Micro-Copy & Disney Contextual Readouts**
   - Integrates playful Disney narrative cues in BRUNOPHESY recommendations (*"We don't talk about Bruno, but we talk about flight forecasts"*, Pooh honey-pot target hints, Tiki chant trajectory analysis).
2. **Approved Proposal 2: Tactile Visual Feedback on Target Hit & Theme Switch**
   - Provides a subtle accent shimmer when switching Disney themes and an animated pulse ring around the Zurgulate badge when target fare is unlocked.
3. **Approved Proposal 3: Dynamic Browser Theme-Color Synchronization**
   - Syncs the document `<meta name="theme-color">` to match the active Disney palette background, ensuring an immersive mobile web experience.
