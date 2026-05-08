import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CarFront,
  Search,
  Calendar,
  Clock,
  Video,
  Zap,
  Map,
  Bike,
  Car,
  Sun,
  Moon
} from 'lucide-react';

const parkings = [
  {
    id: 'phoenix',
    name: 'Phoenix Mall Parking',
    address: 'Lower Parel, Mumbai',
    distance: '2.5 km',
    capacity: 500,
    free: 311,
    baseRate: '₹15/hr',
    carPrice: '₹50',
    bikePrice: '₹15',
    badges: [
      { icon: Video, text: 'CCTV' },
      { icon: Zap, text: 'EV Charging', color: 'text-orange-400' },
      { icon: Map, text: 'Covered' }
    ],
    image: 'https://images.unsplash.com/photo-1616363088386-31c4a8414858?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'inorbit',
    name: 'Inorbit Mall Parking',
    address: 'Malad West, Mumbai',
    distance: '5.1 km',
    capacity: 350,
    free: 220,
    baseRate: '₹10/hr',
    carPrice: '₹40',
    bikePrice: '₹10',
    badges: [
      { icon: Video, text: 'CCTV' },
      { icon: Map, text: 'Covered' },
      { icon: Clock, text: '24/7' }
    ],
    image: 'https://images.unsplash.com/photo-1741955693780-24dd32619f6e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'seasons',
    name: 'Seasons Mall Basement',
    address: 'Magarpatta, Pune',
    distance: '3.8 km',
    capacity: 300,
    free: 145,
    baseRate: '₹25/hr',
    carPrice: '₹80',
    bikePrice: '₹25',
    badges: [
      { icon: Video, text: 'CCTV' },
      { icon: Zap, text: 'EV Charging', color: 'text-orange-400' },
      { icon: Map, text: 'Covered' }
    ],
    image: 'https://images.unsplash.com/photo-1772171386004-9417a5b10392?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'amanora',
    name: 'Amanora Mall Main',
    address: 'Hadapsar, Pune',
    distance: '4.2 km',
    capacity: 400,
    free: 280,
    baseRate: '₹10/hr',
    carPrice: '₹30',
    bikePrice: '₹10',
    badges: [
      { icon: Video, text: 'CCTV' },
      { icon: Clock, text: '24/7' }
    ],
    image: 'https://images.unsplash.com/photo-1740479231174-43522f4eab3f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'pavillion',
    name: 'The Pavillion Parking',
    address: 'S.B. Road, Pune',
    distance: '6.5 km',
    capacity: 250,
    free: 85,
    baseRate: '₹20/hr',
    carPrice: '₹60',
    bikePrice: '₹20',
    badges: [
      { icon: Video, text: 'CCTV' },
      { icon: Zap, text: 'EV Charging', color: 'text-orange-400' }
    ],
    image: 'https://images.unsplash.com/photo-1740479229028-c899cd33e34a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'westend',
    name: 'Westend Mall Parking',
    address: 'Aundh, Pune',
    distance: '8.2 km',
    capacity: 450,
    free: 310,
    baseRate: '₹15/hr',
    carPrice: '₹50',
    bikePrice: '₹15',
    badges: [
      { icon: Map, text: 'Covered' },
      { icon: Clock, text: '24/7' }
    ],
    image: 'https://images.unsplash.com/photo-1701612010613-54d56cc5072f?auto=format&fit=crop&w=600&q=80'
  }
];

const heroBackgrounds = [
  'https://images.unsplash.com/photo-1520106680373-c15a9a5f4c9b?auto=format&fit=crop&q=80&w=2000',
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=2000',
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=2000'
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState('Tue, Apr 14');
  const [time, setTime] = useState('Any Time');
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const fullText1 = "Smart Park ";
  const fullText2 = "PRO";
  const [typedText1, setTypedText1] = useState("");
  const [typedText2, setTypedText2] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Background carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Continuous Typing Animation
  useEffect(() => {
    let timeout;
    if (!isDeleting) {
      if (typedText1.length < fullText1.length) {
        timeout = setTimeout(() => {
          setTypedText1(fullText1.slice(0, typedText1.length + 1));
        }, 75);
      } else if (typedText2.length < fullText2.length) {
        timeout = setTimeout(() => {
          setTypedText2(fullText2.slice(0, typedText2.length + 1));
        }, 100);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 1500);
      }
    } else {
      if (typedText2.length > 0) {
        timeout = setTimeout(() => {
          setTypedText2(fullText2.slice(0, typedText2.length - 1));
        }, 50);
      } else if (typedText1.length > 0) {
        timeout = setTimeout(() => {
          setTypedText1(fullText1.slice(0, typedText1.length - 1));
        }, 30);
      } else {
        timeout = setTimeout(() => setIsDeleting(false), 500);
      }
    }
    return () => clearTimeout(timeout);
  }, [typedText1, typedText2, isDeleting]);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

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

  const filteredParkings = parkings.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-500 ${isDark ? 'bg-[#070b14] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>

      {/* Floating Theme Toggle (since no navbar) */}
      <div className="absolute top-6 right-6 md:right-12 z-50">
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-3 rounded-full transition-all duration-300 shadow-xl ${isDark ? 'bg-slate-800/80 text-yellow-400 hover:bg-slate-700 backdrop-blur-md border border-white/10' : 'bg-white/80 text-slate-700 hover:bg-white backdrop-blur-md border border-slate-200 shadow-slate-200'}`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Hero Section */}
      <section className={`relative pt-24 pb-44 px-6 md:px-12 w-full flex flex-col justify-center overflow-hidden transition-colors duration-500 ${isDark ? 'bg-gradient-to-br from-[#0f172a] to-[#020617]' : 'bg-gradient-to-br from-slate-100 to-white'}`}>

        {/* Parking-Specific Background Visuals */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520106680373-c15a9a5f4c9b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center ${isDark ? 'opacity-15 mix-blend-screen' : 'opacity-[0.05] mix-blend-multiply'}`}></div>
          <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-[#0f172a]/80 via-transparent to-[#070b14]' : 'from-slate-100/90 via-transparent to-slate-50'}`}></div>

          {/* Geometric glowing orbs */}
          <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] ${isDark ? 'bg-blue-600/10' : 'bg-blue-300/30'}`}></div>
          <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] ${isDark ? 'bg-emerald-600/5' : 'bg-emerald-300/20'}`}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center pb-12">



          <h1 className={`text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[1.05] transition-colors min-h-[1.2em] flex flex-wrap justify-center items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span>
              {typedText1}
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 drop-shadow-lg pr-2">
                {typedText2}
              </span>
            </span>
            <span className={`inline-block w-2 md:w-3 h-[0.8em] bg-blue-500 ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span>
          </h1>

          <p className={`text-base md:text-2xl max-w-2xl font-medium mb-16 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Find and book premium parking spots in real-time. An AI-powered vision system for modern smart cities.
          </p>

          {/* Stats Dock */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-4xl">
            <div className={`flex-1 w-full backdrop-blur-2xl border rounded-[2rem] p-8 shadow-2xl flex flex-col items-center justify-center transition-all hover:-translate-y-2 duration-300 ${isDark ? 'border-white/10 bg-[#0f172a]/60 text-white hover:border-blue-500/30' : 'border-slate-200 bg-white/70 text-slate-800 hover:border-blue-300'}`}>
              <div className={`p-4 rounded-2xl mb-4 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <CarFront size={28} />
              </div>
              <div className="text-5xl font-black mb-2">2100</div>
              <div className={`text-xs uppercase tracking-widest font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Total Capacity</div>
            </div>

            <div className={`flex-1 w-full backdrop-blur-2xl border rounded-[2rem] p-8 shadow-2xl flex flex-col items-center justify-center transition-all hover:-translate-y-2 duration-300 ${isDark ? 'border-white/10 bg-[#0f172a]/60 text-white hover:border-indigo-500/30' : 'border-slate-200 bg-white/70 text-slate-800 hover:border-indigo-300'}`}>
              <div className={`p-4 rounded-2xl mb-4 ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <MapPin size={28} />
              </div>
              <div className="text-5xl font-black mb-2">6</div>
              <div className={`text-xs uppercase tracking-widest font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Locations</div>
            </div>

            <div className={`flex-1 w-full backdrop-blur-2xl border rounded-[2rem] p-8 shadow-2xl flex flex-col items-center justify-center transition-all hover:-translate-y-2 duration-300 ${isDark ? 'border-emerald-500/20 bg-[#0f172a]/80 text-white shadow-emerald-500/10 hover:border-emerald-500/50' : 'border-emerald-200 bg-white/80 text-slate-800 shadow-emerald-500/20 hover:border-emerald-400'}`}>
              <div className={`p-4 rounded-2xl mb-4 ${isDark ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-emerald-100 text-emerald-600'}`}>
                <Zap size={28} />
              </div>
              <div className="text-5xl font-black text-emerald-500 mb-2">1332</div>
              <div className={`text-xs uppercase tracking-widest font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Available Now</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Interface */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 md:px-12 -mt-10 md:-mt-12">
        <div className={`border rounded-2xl p-2.5 flex flex-col md:flex-row backdrop-blur-2xl transition-colors duration-500 ${isDark ? 'bg-[#0b1120]/95 border-blue-500/30 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]' : 'bg-white/95 border-blue-200 shadow-blue-900/10'}`}>

          <div className={`flex-1 flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r transition-colors ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <Search className={isDark ? 'text-slate-400' : 'text-slate-500'} size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for malls, landmarks, or areas..."
              className={`w-full bg-transparent border-none focus:outline-none text-sm font-medium transition-colors ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
            />
          </div>

          <div className={`flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r cursor-pointer transition-colors ${isDark ? 'border-slate-700 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
            <Calendar className="text-blue-500" size={20} />
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full md:w-28 bg-transparent border-none focus:outline-none text-sm font-medium transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
            />
          </div>

          <div className={`flex items-center gap-3 px-4 py-3 mr-0 md:mr-2 cursor-pointer transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
            <Clock className="text-blue-500" size={20} />
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`w-full md:w-20 bg-transparent border-none focus:outline-none text-sm font-medium transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
            />
          </div>

          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] w-full md:w-auto mt-2 md:mt-0 flex items-center justify-center gap-2">
            Search Parking
          </button>
        </div>
      </div>

      {/* Parking Location Cards */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-20 min-h-[50vh]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MapPin size={24} className={isDark ? 'text-white' : 'text-slate-800'} />
            <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Featured Locations</h3>
          </div>
          {searchQuery && (
            <div className="text-sm font-medium text-slate-400">
              Found {filteredParkings.length} {filteredParkings.length === 1 ? 'location' : 'locations'}
            </div>
          )}
        </div>

        {filteredParkings.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed transition-colors ${isDark ? 'bg-[#111827]/50 border-white/10' : 'bg-slate-50 border-slate-300'}`}>
            <Search size={48} className={`mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>No parking spots found</h4>
            <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>Try adjusting your search query to find locations.</p>
            <button onClick={() => setSearchQuery('')} className="mt-6 text-blue-500 font-bold hover:text-blue-600">
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredParkings.map((pkg) => {
              const percentFree = (pkg.free / pkg.capacity) * 100;
              return (
                <Link key={pkg.id} to={`/parking/${pkg.id}`} className="group block h-full">
                  <div className={`border rounded-[1.5rem] overflow-hidden transition-all duration-300 flex flex-col h-full relative shadow-xl ${isDark ? 'bg-[#111827] border-white/10 hover:border-blue-500/50 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.25)] hover:-translate-y-1' : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1'}`}>

                    {/* Hero Image Section */}
                    <div className="h-48 relative overflow-hidden bg-slate-900">
                      <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />

                      {/* Top Badges Overlay */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <div className="bg-emerald-500 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div> Live
                        </div>
                        <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full border border-white/20">
                          {pkg.distance}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className={`p-5 flex flex-col flex-grow ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}>

                      {/* Headers */}
                      <div className="mb-4">
                        <h3 className={`text-xl font-bold tracking-tight mb-1 transition-colors ${isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>
                          {pkg.name}
                        </h3>
                        <p className={`text-xs font-medium flex items-center gap-1 opacity-80 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <MapPin size={12} /> {pkg.address}
                        </p>
                      </div>

                      {/* Capacity Progress Bar Interface */}
                      <div className={`p-4 rounded-xl mb-5 transition-colors ${isDark ? 'bg-[#1e293b]/50 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex justify-between items-end mb-2">
                          <span className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Availability</span>
                          <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{pkg.free} <span className="text-xs font-medium opacity-50">/ {pkg.capacity}</span></span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${percentFree > 20 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: `${percentFree}%` }}
                          ></div>
                        </div>
                        <div className={`mt-2 text-[10px] font-semibold flex justify-end ${percentFree > 20 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {percentFree.toFixed(0)}% Free
                        </div>
                      </div>

                      {/* Amenities / Badges */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {pkg.badges.map((badge, idx) => {
                          const Icon = badge.icon;
                          return (
                            <div key={idx} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${isDark ? 'bg-[#1e293b] text-slate-300 border border-white/5' : 'bg-slate-100 text-slate-600 border border-transparent'}`}>
                              <Icon size={14} className={badge.color || (isDark ? 'text-blue-400' : 'text-blue-500')} /> {badge.text}
                            </div>
                          )
                        })}
                      </div>

                      {/* Pricing Footer */}
                      <div className={`mt-auto pt-4 border-t flex items-center justify-between transition-colors ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Starting at</span>
                          <div className="text-2xl font-black text-blue-500">{pkg.baseRate.split('/')[0]}<span className="text-sm font-semibold opacity-60">/{pkg.baseRate.split('/')[1]}</span></div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                            <Bike size={14} className={`mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                            <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{pkg.bikePrice}</span>
                          </div>
                          <div className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                            <Car size={14} className={`mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                            <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{pkg.carPrice}</span>
                          </div>
                          <div className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                            <CarFront size={14} className={`mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                            <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{pkg.carPrice.replace('0', '0').replace('40', '70').replace('50', '80').replace('30', '60')}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

    </div>
  );
};

export default Dashboard;
