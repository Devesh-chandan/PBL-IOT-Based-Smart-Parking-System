

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { 
//   Activity, 
//   Car, 
//   CheckCircle2, 
//   Clock, 
//   LayoutDashboard, 
//   MapPin, 
//   ShieldCheck, 
//   Wifi, 
//   WifiOff 
// } from 'lucide-react'; // Optional: npm install lucide-react

// const API_BASE = "http://localhost:8000";
// const TOTAL_SLOTS = 20;

// const App = () => {
//   const [data, setData] = useState([]);
//   const [status, setStatus] = useState("Connecting");

//   const fetchData = async () => {
//     try {
//       const rid = Math.random().toString(36).substring(7);
//       const res = await axios.get(`${API_BASE}/parking-status?rid=${rid}`);
//       if (Array.isArray(res.data)) {
//         setData(res.data);
//         setStatus("Connected");
//       }
//     } catch (err) {
//       setStatus("Offline");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   const getParkingLayout = () => {
//     let slots = Array(TOTAL_SLOTS).fill(null);
//     const latestStatusMap = {};
//     data.forEach(record => {
//       const plate = record['Plate Number'] || record['PlateNumber'];
//       if (plate && plate !== "-") latestStatusMap[plate] = record;
//     });

//     const activeCars = Object.values(latestStatusMap).filter(car => car.Status === 'ENTERED');

//     activeCars.forEach((car, index) => {
//       const assignedSlot = parseInt(car.Slot) || (index + 1);
//       if (assignedSlot <= TOTAL_SLOTS) {
//         slots[assignedSlot - 1] = car;
//       }
//     });
//     return slots;
//   };

//   const parkingSlots = getParkingLayout();
//   const occupiedCount = parkingSlots.filter(s => s !== null).length;
//   const freeSlots = TOTAL_SLOTS - occupiedCount;
//   const occupancyRate = ((occupiedCount / TOTAL_SLOTS) * 100).toFixed(0);

//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
//       {/* HEADER */}
//       <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//         <div>
//           <div className="flex items-center gap-2 mb-1">
           
//             <h1 className="text-2xl font-black tracking-tight text-white italic uppercase">
//             <span className="text-blue-500">Smart-Park</span> Pro
//             </h1>
//           </div>
          
//         </div>

//         <div className="flex items-center gap-4">
//           <div className={`flex items-center gap-2 px-4 py-2 rounded-full border bg-slate-900/50 backdrop-blur-sm ${
//             status === "Connected" ? 'border-emerald-500/20 text-emerald-400' : 'border-red-500/20 text-red-400'
//           }`}>
//             {status === "Connected" ? <Wifi size={14} /> : <WifiOff size={14} />}
//             <span className="text-[10px] font-bold uppercase tracking-widest">{status}</span>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto">
//         {/* STATS OVERVIEW */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <StatCard label="Total Capacity" value={TOTAL_SLOTS} subValue="Units Available" icon={<LayoutDashboard className="text-blue-400" />} color="blue" />
//           <StatCard label="Available Spots" value={freeSlots} subValue={`${occupancyRate}% Occupancy`} icon={<CheckCircle2 className="text-emerald-400" />} color="emerald" />
//           <StatCard label="Live Vehicles" value={occupiedCount} subValue="Currently Parked" icon={<Activity className="text-orange-400" />} color="orange" />
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
//           {/* MAP SECTION */}
//           <div className="xl:col-span-3">
//             <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-md">
//               <div className="flex items-center justify-between mb-8">
//                 <div className="flex items-center gap-3">
//                   <MapPin size={18} className="text-slate-500" />
//                   <h2 className="text-lg font-bold text-white">PHOENIX MARKET CITY Parking 2</h2>
//                 </div>
//                 <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tighter">
//                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/40"></div> Vacant</div>
//                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/40"></div> Occupied</div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
//                 {parkingSlots.map((car, i) => (
//                   <SlotItem key={i} index={i} car={car} />
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* HISTORY SECTION */}
//           <div className="xl:col-span-1">
//             <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-md h-full flex flex-col">
//               <div className="flex items-center gap-3 mb-6">
//                 <Clock size={18} className="text-slate-500" />
//                 <h2 className="text-lg font-bold text-white">Activity Log</h2>
//               </div>
              
//               <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow" style={{ maxHeight: '600px' }}>
//                 {data.slice().reverse().map((item, index) => (
//                   <HistoryItem key={index} item={item} />
//                 ))}
//               </div>

//               <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
//                 <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase italic">
//                   <ShieldCheck size={12} /> Encrypted Node
//                 </div>
//                 <span className="text-[10px] text-slate-600 font-mono italic">v2.4.0</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// // SUB-COMPONENTS FOR CLEANER CODE
// const StatCard = ({ label, value, subValue, icon, color }) => (
//   <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl backdrop-blur-md flex items-center justify-between group hover:border-slate-700 transition-all">
//     <div>
//       <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
//       <h3 className="text-3xl font-black text-white">{value}</h3>
//       <p className="text-slate-600 text-[10px] font-medium">{subValue}</p>
//     </div>
//     <div className={`p-4 bg-slate-800/50 rounded-2xl group-hover:scale-110 transition-transform`}>
//       {icon}
//     </div>
//   </div>
// );

// const SlotItem = ({ index, car }) => (
//   <div className={`relative group h-36 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-500 ${
//     car 
//     ? 'border-red-500/40 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
//     : 'border-slate-800 bg-slate-900/20 hover:border-emerald-500/30'
//   }`}>
//     <div className="absolute top-3 left-4 flex items-center gap-1.5">
//       <div className={`w-1.5 h-1.5 rounded-full ${car ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
//       <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">P-{index + 1}</span>
//     </div>

//     {car ? (
//       <div className="flex flex-col items-center">
//         <div className="mb-2 relative">
//           <Car size={24} className="text-red-500 opacity-80" />
//           <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-red-500/30 blur-sm rounded-full"></div>
//         </div>
//         <p className="text-[10px] font-black text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">
//           {car['Plate Number']}
//         </p>
//       </div>
//     ) : (
//       <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest group-hover:text-emerald-500/40 transition-colors">Open</span>
//     )}
//   </div>
// );

// const HistoryItem = ({ item }) => (
//   <div className="group bg-slate-800/20 border border-slate-800/50 p-3 rounded-xl hover:bg-slate-800/40 transition-all">
//     <div className="flex justify-between items-start mb-2">
//       <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
//         item.Status === 'ENTERED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
//       }`}>
//         {item.Status}
//       </span>
//       <span className="text-[9px] font-mono text-slate-600 group-hover:text-slate-400 transition-colors">{item['Entry Time']}</span>
//     </div>
//     <div className="flex justify-between items-end">
//       <h4 className="text-sm font-mono font-bold text-slate-300">{item['Plate Number'] || "UNKNOWN"}</h4>
//       <span className="text-[9px] font-bold text-slate-600 italic">Slot {item.Slot || "N/A"}</span>
//     </div>
//   </div>
// );

// export default App;




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  Car, 
  CheckCircle2, 
  Clock, 
  LayoutDashboard, 
  MapPin, 
  ShieldCheck, 
  Wifi, 
  WifiOff 
} from 'lucide-react';

const API_BASE = "http://localhost:8000";
const TOTAL_SLOTS = 20;

const App = () => {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("Connecting");

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

  // UPDATED LOGIC: Handles corrupted slot data and fallback positioning
  const getParkingLayout = () => {
    let slots = Array(TOTAL_SLOTS).fill(null);
    const latestStatusMap = {};
    
    // 1. Get the most recent record for each unique plate
    data.forEach(record => {
      const plate = record['Plate Number'] || record['PlateNumber'];
      if (plate && plate !== "-") {
        latestStatusMap[plate] = record;
      }
    });

    // 2. Filter for only cars that are currently "ENTERED"
    const activeCars = Object.values(latestStatusMap).filter(car => car.Status === 'ENTERED');

    // 3. Place them in the grid
    activeCars.forEach((car) => {
      const parsedSlot = parseInt(car.Slot);
      
      // If slot is a valid number between 1 and 20, use it
      if (!isNaN(parsedSlot) && parsedSlot >= 1 && parsedSlot <= TOTAL_SLOTS) {
        slots[parsedSlot - 1] = car;
      } else {
        // FALLBACK: If slot is invalid (e.g., "1900-01-02"), find first available space
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
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black tracking-tight text-white italic uppercase">
              <span className="text-blue-500">Smart-Park</span> Pro
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border bg-slate-900/50 backdrop-blur-sm ${
            status === "Connected" ? 'border-emerald-500/20 text-emerald-400' : 'border-red-500/20 text-red-400'
          }`}>
            {status === "Connected" ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{status}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Capacity" value={TOTAL_SLOTS} subValue="Units Available" icon={<LayoutDashboard className="text-blue-400" />} color="blue" />
          <StatCard label="Available Spots" value={freeSlots} subValue={`${occupancyRate}% Occupancy`} icon={<CheckCircle2 className="text-emerald-400" />} color="emerald" />
          <StatCard label="Live Vehicles" value={occupiedCount} subValue="Currently Parked" icon={<Activity className="text-orange-400" />} color="orange" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* MAP SECTION */}
          <div className="xl:col-span-3">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-slate-500" />
                  <h2 className="text-lg font-bold text-white">PHOENIX MARKET CITY Parking 2</h2>
                </div>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tighter">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/40"></div> Vacant</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/40"></div> Occupied</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {parkingSlots.map((car, i) => (
                  <SlotItem key={i} index={i} car={car} />
                ))}
              </div>
            </div>
          </div>

          {/* HISTORY SECTION */}
          <div className="xl:col-span-1">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-md h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Clock size={18} className="text-slate-500" />
                <h2 className="text-lg font-bold text-white">Activity Log</h2>
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow" style={{ maxHeight: '600px' }}>
                {data.slice().reverse().map((item, index) => (
                  <HistoryItem key={index} item={item} />
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase italic">
                  <ShieldCheck size={12} /> Encrypted Node
                </div>
                <span className="text-[10px] text-slate-600 font-mono italic">v2.4.0</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, subValue, icon, color }) => (
  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl backdrop-blur-md flex items-center justify-between group hover:border-slate-700 transition-all">
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-white">{value}</h3>
      <p className="text-slate-600 text-[10px] font-medium">{subValue}</p>
    </div>
    <div className={`p-4 bg-slate-800/50 rounded-2xl group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
  </div>
);

const SlotItem = ({ index, car }) => (
  <div className={`relative group h-36 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-500 ${
    car 
    ? 'border-red-500/40 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
    : 'border-slate-800 bg-slate-900/20 hover:border-emerald-500/30'
  }`}>
    <div className="absolute top-3 left-4 flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${car ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">P-{index + 1}</span>
    </div>

    {car ? (
      <div className="flex flex-col items-center">
        <div className="mb-2 relative">
          <Car size={24} className="text-red-500 opacity-80" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-red-500/30 blur-sm rounded-full"></div>
        </div>
        <p className="text-[10px] font-black text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">
          {car['Plate Number']}
        </p>
      </div>
    ) : (
      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest group-hover:text-emerald-500/40 transition-colors">Open</span>
    )}
  </div>
);

const HistoryItem = ({ item }) => {
  // Logic to handle messy slot data in the display
  const parsedSlot = parseInt(item.Slot);
  const displaySlot = (isNaN(parsedSlot) || parsedSlot > TOTAL_SLOTS) ? "Auto" : item.Slot;

  return (
    <div className="group bg-slate-800/20 border border-slate-800/50 p-3 rounded-xl hover:bg-slate-800/40 transition-all">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
          item.Status === 'ENTERED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {item.Status}
        </span>
        <span className="text-[9px] font-mono text-slate-600 group-hover:text-slate-400 transition-colors">{item['Entry Time'] || item['Time']}</span>
      </div>
      <div className="flex justify-between items-end">
        <h4 className="text-sm font-mono font-bold text-slate-300">{item['Plate Number'] || "UNKNOWN"}</h4>
        <span className="text-[9px] font-bold text-slate-600 italic">Slot {displaySlot}</span>
      </div>
    </div>
  );
};

export default App;