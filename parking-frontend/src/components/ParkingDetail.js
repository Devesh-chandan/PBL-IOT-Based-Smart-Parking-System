import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { 
  Activity, 
  Car,
  CarFront,
  Bike,
  CheckCircle2, 
  Clock, 
  LayoutDashboard, 
  MapPin, 
  ShieldCheck, 
  Wifi, 
  WifiOff,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';

const API_BASE = "http://localhost:8000";

const PARKING_CONFIGS = {
  'phoenix': { name: 'PHOENIX MARKET CITY Parking 2', capacity: 20, bike: 15, car: 50, suv: 80, mapQuery: 'Phoenix+Marketcity+Pune' },
  'inorbit': { name: 'INORBIT MALL Parking 1', capacity: 50, bike: 10, car: 40, suv: 70, mapQuery: 'Inorbit+Mall+Pune' },
  'seasons': { name: 'SEASONS MALL Basement', capacity: 30, bike: 25, car: 80, suv: 120, mapQuery: 'Seasons+Mall+Pune' },
  'amanora': { name: 'AMANORA MALL Main', capacity: 40, bike: 10, car: 30, suv: 50, mapQuery: 'Amanora+Mall+Pune' },
  'pavillion': { name: 'THE PAVILLION Parking', capacity: 25, bike: 12, car: 35, suv: 60, mapQuery: 'The+Pavillion+Pune' },
  'westend': { name: 'WESTEND MALL Parking 1', capacity: 45, bike: 15, car: 45, suv: 75, mapQuery: 'Westend+Mall+Pune' },
};

const ParkingDetail = () => {
  const { id } = useParams();
  
  const config = PARKING_CONFIGS[id] || { name: 'UNKNOWN PARKING', capacity: 20, bike: 10, car: 40, suv: 60 };
  const TOTAL_SLOTS = config.capacity;

  const [data, setData] = useState([]);
  const [status, setStatus] = useState("Connecting");
  
  // Theme Toggle State 
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const fetchData = async () => {
    try {
      const rid = Math.random().toString(36).substring(7);
      const res = await axios.get(`${API_BASE}/parking-status?rid=${rid}`);
      if (Array.isArray(res.data)) {
        setData(res.data);
        setStatus("Connected");
      }
    } catch (err) {
      setStatus("Offline");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const getParkingLayout = () => {
    let slots = Array(TOTAL_SLOTS).fill(null);
    const latestStatusMap = {};
    
    data.forEach(record => {
      const plate = record['Plate Number'] || record['PlateNumber'];
      if (plate && plate !== "-") {
        latestStatusMap[plate] = record;
      }
    });

    const activeCars = Object.values(latestStatusMap).filter(car => car.Status === 'ENTERED');

    activeCars.forEach((car) => {
      const parsedSlot = parseInt(car.Slot);
      if (!isNaN(parsedSlot) && parsedSlot >= 1 && parsedSlot <= TOTAL_SLOTS) {
        slots[parsedSlot - 1] = car;
      } else {
        const firstEmptyIndex = slots.findIndex(s => s === null);
        if (firstEmptyIndex !== -1) {
          slots[firstEmptyIndex] = car;
        }
      }
    });
    return slots;
  };

  const parkingSlots = getParkingLayout();
  const occupiedCount = parkingSlots.filter(s => s !== null).length;
  const freeSlots = TOTAL_SLOTS - occupiedCount;
  const occupancyRate = ((occupiedCount / TOTAL_SLOTS) * 100).toFixed(0);

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 overflow-x-hidden p-4 md:p-8 transition-colors duration-500 ${isDark ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-1">
            <Link to="/" className={`px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border transition-colors ${isDark ? 'text-slate-400 hover:text-white bg-slate-900 border-slate-800 hover:border-slate-700' : 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 hover:border-slate-300'}`}>
               <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Hub</span><span className="sm:hidden">Back</span>
            </Link>
            <h1 className={`text-xl md:text-2xl font-black tracking-tight italic uppercase transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className="text-blue-500">Smart-Park</span> Pro
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-full transition-all duration-300 shadow-sm border ${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 border-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-colors ${
            status === "Connected" 
              ? (isDark ? 'bg-slate-900/50 border-emerald-500/20 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-600') 
              : (isDark ? 'bg-slate-900/50 border-red-500/20 text-red-400' : 'bg-white border-red-200 text-red-600')
          }`}>
            {status === "Connected" ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{status}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatCard label="Total Capacity" value={TOTAL_SLOTS} subValue="Units Available" icon={<LayoutDashboard className="text-blue-500" />} color="blue" isDark={isDark} />
          <StatCard label="Available Spots" value={freeSlots} subValue={`${occupancyRate}% Occupancy`} icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" isDark={isDark} />
          <StatCard label="Live Vehicles" value={occupiedCount} subValue="Currently Parked" icon={<Activity className="text-orange-500" />} color="orange" isDark={isDark} />
        </div>

        {/* PRICING OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <PricingCard type="Bike" price={config.bike} isDark={isDark} />
           <PricingCard type="Car" price={config.car} isDark={isDark} />
           <PricingCard type="SUV" price={config.suv} isDark={isDark} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* MAP SECTION */}
          <div className="xl:col-span-3">
            <div className={`border p-6 rounded-[2rem] backdrop-blur-md transition-colors ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                  <h2 className={`text-lg font-bold uppercase transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>{config.name}</h2>
                </div>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tighter">
                  <div className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}><div className={`w-3 h-3 rounded-sm border ${isDark ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-emerald-100 border-emerald-300'}`}></div> Vacant</div>
                  <div className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}><div className={`w-3 h-3 rounded-sm border ${isDark ? 'bg-red-500/20 border-red-500/40' : 'bg-red-100 border-red-300'}`}></div> Occupied</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {parkingSlots.map((car, i) => (
                  <SlotItem key={i} index={i} car={car} isDark={isDark} />
                ))}
              </div>
            </div>
          </div>

          {/* HISTORY SECTION */}
          <div className="xl:col-span-1">
            <div className={`border p-6 rounded-[2rem] backdrop-blur-md h-full flex flex-col transition-colors ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]'}`}>
              <div className="flex items-center gap-3 mb-6">
                <Clock size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                <h2 className={`text-lg font-bold transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>Activity Log</h2>
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow" style={{ maxHeight: '600px' }}>
                {data.slice().reverse().map((item, index) => (
                  <HistoryItem key={index} item={item} TOTAL_SLOTS={TOTAL_SLOTS} isDark={isDark} />
                ))}
              </div>

              <div className={`mt-6 pt-4 border-t flex items-center justify-between transition-colors ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <ShieldCheck size={12} /> Encrypted Node
                </div>
                <span className={`text-[10px] font-mono italic ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>v2.4.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE LOCATION MAP INTEGRATION */}
        <section className={`mt-8 mb-8 border rounded-[2rem] overflow-hidden backdrop-blur-md transition-colors ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
           <div className={`p-5 md:p-6 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
             <div className="flex items-center gap-4">
               <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                 <MapPin size={24} />
               </div>
               <div>
                  <h2 className={`text-lg md:text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Live Navigation Coordinates</h2>
                  <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{config.name}</p>
               </div>
             </div>
             
             <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/20 text-xs font-bold uppercase tracking-widest shadow-sm">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
               GPS Active
             </div>
           </div>

           {/* Map Embed Container */}
           <div className="w-full h-80 md:h-[450px] relative bg-slate-100 dark:bg-slate-900/80">
             <iframe 
                title="Google Maps Live Location embed"
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: isDark ? 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' : 'none' }} 
                loading="lazy" 
                allowFullScreen
                src={`https://www.google.com/maps?q=${config.mapQuery || 'Pune'}&output=embed`}
             ></iframe>
             <div className="absolute inset-0 pointer-events-none border-t border-black/5 dark:border-white/5"></div>
           </div>
        </section>

      </main>
    </div>
  );
};

const StatCard = ({ label, value, subValue, icon, color, isDark }) => (
  <div className={`border p-5 rounded-3xl backdrop-blur-md flex items-center justify-between group transition-all ${isDark ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
    <div>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{label}</p>
      <h3 className={`text-3xl font-black transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</h3>
      <p className={`text-[10px] font-medium transition-colors ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>{subValue}</p>
    </div>
    <div className={`p-4 rounded-2xl group-hover:scale-110 transition-all ${isDark ? 'bg-slate-800/50' : `bg-${color}-50`}`}>
      {icon}
    </div>
  </div>
);

const PricingCard = ({ type, price, isDark }) => {
  const styles = {
    Bike: { icon: Bike, darkBg: 'bg-emerald-500/5', darkBorder: 'border-emerald-500/20', darkHover: 'hover:bg-emerald-500/10', lightBg: 'bg-emerald-50/50', lightBorder: 'border-emerald-200', lightHover: 'hover:bg-emerald-100', textDark: 'text-emerald-400', textLight: 'text-emerald-600' },
    Car: { icon: Car, darkBg: 'bg-blue-500/5', darkBorder: 'border-blue-500/20', darkHover: 'hover:bg-blue-500/10', lightBg: 'bg-blue-50/50', lightBorder: 'border-blue-200', lightHover: 'hover:bg-blue-100', textDark: 'text-blue-400', textLight: 'text-blue-600' },
    SUV: { icon: CarFront, darkBg: 'bg-purple-500/5', darkBorder: 'border-purple-500/20', darkHover: 'hover:bg-purple-500/10', lightBg: 'bg-purple-50/50', lightBorder: 'border-purple-200', lightHover: 'hover:bg-purple-100', textDark: 'text-purple-400', textLight: 'text-purple-600' }
  }[type];

  const Icon = styles.icon;

  return (
    <div className={`p-4 rounded-2xl border flex items-center shadow-sm group transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${isDark ? `${styles.darkBg} ${styles.darkBorder} ${styles.darkHover}` : `${styles.lightBg} ${styles.lightBorder} ${styles.lightHover}`}`}>
      <div className={`p-3 rounded-xl mr-4 transition-colors ${isDark ? `bg-[#0f172a]/50 ${styles.textDark}` : `bg-white shadow-sm ${styles.textLight}`}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{type} Parking</p>
        <h4 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
          ₹{price}<span className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/hr</span>
        </h4>
      </div>
    </div>
  );
};

const SlotItem = ({ index, car, isDark }) => (
  <div className={`relative group h-36 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-500 ${
    car 
    ? (isDark ? 'border-red-500/40 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'border-red-400/50 bg-red-50 shadow-[0_4px_10px_rgba(239,68,68,0.1)]') 
    : (isDark ? 'border-slate-800 bg-slate-900/20 hover:border-emerald-500/30' : 'border-slate-200 bg-slate-50 hover:border-emerald-400/50')
  }`}>
    <div className="absolute top-3 left-4 flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${car ? 'bg-red-500 animate-pulse' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`}></div>
      <span className={`text-[9px] font-black uppercase tracking-tighter ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>P-{index + 1}</span>
    </div>

    {car ? (
      <div className="flex flex-col items-center">
        <div className="mb-2 relative">
          <Car size={24} className="text-red-500 opacity-90" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-red-500/30 blur-sm rounded-full"></div>
        </div>
        <p className={`text-[10px] font-black px-2 py-0.5 rounded border font-mono shadow-sm ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'}`}>
          {car['Plate Number']}
        </p>
      </div>
    ) : (
      <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-slate-700 group-hover:text-emerald-500/40' : 'text-slate-300 group-hover:text-emerald-500'}`}>Open</span>
    )}
  </div>
);

const HistoryItem = ({ item, TOTAL_SLOTS, isDark }) => {
  const parsedSlot = parseInt(item.Slot);
  const displaySlot = (isNaN(parsedSlot) || parsedSlot > TOTAL_SLOTS) ? "Auto" : item.Slot;

  return (
    <div className={`group border p-3 rounded-xl transition-all ${isDark ? 'bg-slate-800/20 border-slate-800/50 hover:bg-slate-800/40' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter border ${
          item.Status === 'ENTERED' 
            ? (isDark ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200') 
            : (isDark ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-red-100 text-red-700 border-red-200')
        }`}>
          {item.Status}
        </span>
        <span className={`text-[9px] font-mono transition-colors ${isDark ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-500'}`}>{item['Entry Time'] || item['Time']}</span>
      </div>
      <div className="flex justify-between items-end">
        <h4 className={`text-sm font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item['Plate Number'] || "UNKNOWN"}</h4>
        <span className={`text-[9px] font-bold italic ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Slot {displaySlot}</span>
      </div>
    </div>
  );
};

export default ParkingDetail;
