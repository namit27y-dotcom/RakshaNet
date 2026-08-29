import React, { useState } from 'react';
import { DisasterType } from '../../types';
import { ShieldAlert, CheckCircle2, XCircle, Info, CloudRain, Wind, Activity, Flame, Mountain } from 'lucide-react';

interface GuidelineCategory {
  type: DisasterType;
  title: string;
  before: string[];
  during: string[];
  after: string[];
  donts: string[];
}

const GUIDELINES_DATA: GuidelineCategory[] = [
  {
    type: 'flood',
    title: 'Floods & Waterlogging',
    before: [
      'Know the high-ground evacuation routes in your municipal ward.',
      'Keep drainage outlets around home unblocked.',
      'Store important documents & medicines in sealed waterproof bags.',
      'Charge cellphones and power banks fully.'
    ],
    during: [
      'Turn off main electricity switch & gas valve before evacuating.',
      'Move immediately to designated flood shelters or upper floors.',
      'Do not attempt to walk or drive through moving flood waters.',
      'Drink boiled or chlorinated water only.'
    ],
    after: [
      'Check for structural cracks before re-entering home.',
      'Watch out for submerged electrical wires and fallen poles.',
      'Disinfect all food utensils before reuse.',
      'Report stagnant water accumulation to local health department.'
    ],
    donts: [
      'DO NOT touch submerged electric appliances or power cords.',
      'DO NOT walk in flood water where depth exceeds knee-height.',
      'DO NOT eat food that has come into contact with flood water.'
    ]
  },
  {
    type: 'cyclone',
    title: 'Cyclones & Storm Surges',
    before: [
      'Secure roof tiles, tin sheets, and trim weak tree branches.',
      'Board up glass windows or apply criss-cross tape to prevent shattering.',
      'Store 3-5 days supply of drinking water and non-perishable food.',
      'Track official IMD / SDMA bulletins on battery radio.'
    ],
    during: [
      'Stay indoors in the safest inner room away from doors & windows.',
      'Do not go out when the cyclone "eye" passes (lull before violent wind returns).',
      'Keep emergency flashlights handy. Do not use open kerosene lamps.'
    ],
    after: [
      'Beware of loose electric wires and dangling roof materials.',
      'Avoid driving near coastal seawalls or inundated roads.',
      'Cooperates with NDRF rescue teams and relief authorities.'
    ],
    donts: [
      'DO NOT venture out to sea or venture near beaches during warnings.',
      'DO NOT spread unverified social media rumors regarding landfall.'
    ]
  },
  {
    type: 'earthquake',
    title: 'Earthquakes & Seismic Tremors',
    before: [
      'Fasten heavy furniture, water heaters, and wall mirrors securely.',
      'Identify safe spots in each room (under sturdy tables, beside interior load walls).',
      'Keep an emergency whistle and torch beside your bed.'
    ],
    during: [
      'DROP, COVER, AND HOLD ON under heavy desk or bed.',
      'If outdoors, move to open area away from tall buildings, trees, and power lines.',
      'If driving, pull over to a safe open spot away from overpasses.'
    ],
    after: [
      'Be prepared for aftershocks.',
      'Check for gas leaks. Do not strike matches or turn on switches if gas smell exists.',
      'Use stairs instead of elevators when exiting damaged buildings.'
    ],
    donts: [
      'DO NOT use elevators during or immediately after tremors.',
      'DO NOT run out of buildings during violent shaking (risk of falling bricks).'
    ]
  },
  {
    type: 'heatwave',
    title: 'Extreme Summer Heatwaves',
    before: [
      'Install shade curtains and reflective window covers.',
      'Keep ORS, glucose, electoral, and lemon water stocked.',
      'Schedule heavy outdoor physical work during early morning or evening hours.'
    ],
    during: [
      'Drink water frequently even if not feeling thirsty.',
      'Wear lightweight, loose-fitting, light-colored cotton clothes.',
      'Cover head with wet cloth, cap, or umbrella when stepping outdoors.'
    ],
    after: [
      'If someone suffers heatstroke, move to cool room & apply cold wet sponge.',
      'Give ORS solution slowly if person is conscious.'
    ],
    donts: [
      'DO NOT leave children or pets inside parked closed vehicles.',
      'DO NOT drink alcohol, tea, coffee, or carbonated soft drinks which dehydrate the body.'
    ]
  }
];

export const DosAndDonts: React.FC = () => {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>('flood');
  const [activeTab, setActiveTab] = useState<'before' | 'during' | 'after'>('during');

  const activeGuide = GUIDELINES_DATA.find((g) => g.type === selectedDisaster) || GUIDELINES_DATA[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase">FR1.3 Official NDMA Guidelines</span>
          </div>
          <h3 className="text-2xl font-bold font-heading text-slate-900">Disaster Dos & Don'ts Reference</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Verified step-by-step safety protocols compiled from National Disaster Management Authority (NDMA) standards.
          </p>
        </div>

        {/* Disaster Type Selector */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedDisaster('flood')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              selectedDisaster === 'flood'
                ? 'bg-blue-100 text-blue-900 border-blue-300 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CloudRain className="w-4 h-4 text-blue-600" />
            <span>Floods</span>
          </button>

          <button
            onClick={() => setSelectedDisaster('cyclone')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              selectedDisaster === 'cyclone'
                ? 'bg-teal-100 text-teal-900 border-teal-300 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Wind className="w-4 h-4 text-teal-600" />
            <span>Cyclones</span>
          </button>

          <button
            onClick={() => setSelectedDisaster('earthquake')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              selectedDisaster === 'earthquake'
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-600" />
            <span>Earthquakes</span>
          </button>

          <button
            onClick={() => setSelectedDisaster('heatwave')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              selectedDisaster === 'heatwave'
                ? 'bg-orange-100 text-orange-900 border-orange-300 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-600" />
            <span>Heatwaves</span>
          </button>
        </div>
      </div>

      {/* Lifecycle Stage Switcher */}
      <div className="flex items-center justify-center p-1 rounded-xl bg-slate-100 border border-slate-200 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('before')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'before' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          BEFORE Event
        </button>
        <button
          onClick={() => setActiveTab('during')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'during' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          DURING Event
        </button>
        <button
          onClick={() => setActiveTab('after')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'after' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          AFTER Event
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step List */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase font-heading">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Recommended Action Steps ({activeTab.toUpperCase()})</span>
          </div>

          <div className="space-y-3">
            {activeGuide[activeTab].map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-800"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-amber-800 font-bold font-mono text-[11px] shrink-0">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Warnings / Don'ts Box */}
        <div className="glass-panel p-6 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-700 uppercase font-heading">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>CRITICAL DON'TS</span>
          </div>

          <div className="space-y-3">
            {activeGuide.donts.map((dont, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-rose-200 text-xs text-rose-800 leading-relaxed shadow-sm font-medium"
              >
                {dont}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
