
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Car, Clock, Hash } from 'lucide-react';

// const API_BASE = "http://localhost:8000";

// const App = () => {
//   const [data, setData] = useState([]);

//   const fetchData = async () => {
//     try {
//       // ?t= avoids browser caching
//       const res = await axios.get(`${API_BASE}/parking-status?t=${Date.now()}`);
//       setData(res.data);
//     } catch (err) {
//       console.error("Connection to backend failed");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#0f172a] text-white p-10 font-sans">
//       <h1 className="text-3xl font-black text-blue-500 mb-10 tracking-tight italic">
//         PARK<span className="text-white not-italic">SENSE</span> DASHBOARD
//       </h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {data.map((item, index) => (
//           <div key={index} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
//             <div className="flex justify-between items-start mb-4">
//               <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500">
//                 <Car size={24} />
//               </div>
//               <div className="flex items-center gap-1 text-slate-500 font-mono text-xs font-bold">
//                 <Hash size={12}/> {item.ID}
//               </div>
//             </div>

//             {/* MATCHED TO YOUR EXCEL: 'Plate Number' */}
//             <h2 className="text-2xl font-mono font-bold tracking-tighter mb-4">
//               {item['Plate Number']}
//             </h2>

//             <div className="space-y-2 border-t border-slate-800 pt-4">
//               <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
//                 <span className="text-slate-500">Status</span>
//                 <span className={item.Status === 'EXITED' ? 'text-rose-500' : 'text-teal-400'}>
//                   {item.Status}
//                 </span>
//               </div>
              
//               <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
//                 <span className="text-slate-500 font-mono">Entry</span>
//                 <span className="text-slate-300">{item['Entry Time']}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default App;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Car, RefreshCcw, Database } from 'lucide-react';

// const API_BASE = "http://localhost:8000";

// const App = () => {
//   const [data, setData] = useState([]);
//   const [isSyncing, setIsSyncing] = useState(false);

//   const fetchData = async () => {
//     setIsSyncing(true);
//     try {
//       // The 'v' parameter ensures the browser NEVER uses a cached version
//       const res = await axios.get(`${API_BASE}/parking-status?v=${Date.now()}`);
//       setData(res.data);
//     } catch (err) {
//       console.error("Sync failed");
//     }
//     setTimeout(() => setIsSyncing(false), 500);
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 3000); // Check every 3 seconds
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
//       <div className="max-w-5xl mx-auto">
//         <div className="flex justify-between items-center mb-10 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
//           <div>
//             <h1 className="text-2xl font-black text-blue-500 italic">PARKSENSE <span className="text-white not-italic font-light">PRO</span></h1>
//             <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-1">CONNECTED TO: {API_BASE}</p>
//           </div>
//           <button 
//             onClick={fetchData}
//             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-xs font-bold transition-all"
//           >
//             <RefreshCcw size={14} className={isSyncing ? "animate-spin" : ""} />
//             {isSyncing ? "SYNCING..." : "FORCE RELOAD"}
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {data.map((item, index) => (
//             <div key={index} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-slate-700 transition-all group">
//               <div className="flex justify-between items-center mb-6">
//                 <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all">
//                   <Car size={24} />
//                 </div>
//                 <div className="text-[10px] font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
//                   ID: {item.ID}
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">Plate Number</p>
//                 <h2 className="text-3xl font-mono font-bold tracking-tight text-white">{item['Plate Number']}</h2>
//               </div>

//               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
//                 <div>
//                   <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Status</p>
//                   <span className={`text-xs font-bold ${item.Status === 'EXITED' ? 'text-rose-500' : 'text-teal-400 underline decoration-teal-500/30'}`}>
//                     {item.Status}
//                   </span>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Entry Time</p>
//                   <p className="text-xs font-mono text-slate-300">{item['Entry Time']}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const API_BASE = "http://localhost:8000";

// const App = () => {
//   const [data, setData] = useState([]);

//   const fetchData = async () => {
//     try {
//       // 'rid' (Random ID) is the key to forcing the browser to update
//       const rid = Math.random().toString(36).substring(7);
//       const res = await axios.get(`${API_BASE}/parking-status?rid=${rid}`);
      
//       console.log("New data received:", res.data); // Check your browser console (F12)
//       setData(res.data);
//     } catch (err) {
//       console.error("Fetch failed");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 2000); // Fast 2-second update
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#020617] text-white p-10">
//       <h1 className="text-2xl font-bold text-blue-500 mb-8 italic">PARKSENSE LIVE</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {data.map((item, index) => (
//           <div key={index} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
//             <div className="text-xs text-slate-500 font-mono mb-2">ID: {item.ID}</div>
            
//             {/* THIS IS THE TEXT YOU ARE EDITING IN EXCEL */}
//             <div className="text-3xl font-bold font-mono text-teal-400">
//                 {item['Plate Number']}
//             </div>
            
//             <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
//               <span className="text-[10px] uppercase font-black text-slate-400">Status</span>
//               <span className="text-xs font-bold text-white">{item.Status}</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

const App = () => {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("Connecting...");

  const fetchData = async () => {
    try {
      // rid prevents the browser from showing 'old' cached data
      const rid = Math.random().toString(36).substring(7);
      const res = await axios.get(`${API_BASE}/parking-status?rid=${rid}`);
      
      if (Array.isArray(res.data)) {
        setData(res.data);
        setStatus("Connected to Cloud");
      } else {
        // If the backend sends an error object instead of a list
        setStatus("Error: Invalid Data Format");
      }
    } catch (err) {
      setStatus("Backend Offline");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-blue-500 italic">PARKSENSE LIVE</h1>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
          <div className={`w-2 h-2 rounded-full ${status === "Connected to Cloud" ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status}</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center p-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
          Waiting for Google Sheets data...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((item, index) => (
            <div key={index} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-mono text-slate-600">ID: {item.ID || "N/A"}</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${item.Status === 'EXITED' ? 'border-red-500/30 text-red-500' : 'border-emerald-500/30 text-emerald-500'}`}>
                  {item.Status || "UNKNOWN"}
                </span>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">Plate Number</p>
                <h2 className="text-4xl font-mono font-black text-white tracking-tighter truncate">
                  {/* Safety: Check for multiple common header typos */}
                  {item['Plate Number'] || item['PlateNumber'] || item['plate'] || "---"}
                </h2>
              </div>

              <div className="pt-6 border-t border-slate-800">
                 <div className="text-left">
                  <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Entry Time</p>
                  <p className="text-xs font-mono text-slate-300">{item['Entry Time'] || "--:--"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;