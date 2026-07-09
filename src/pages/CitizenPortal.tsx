import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapContainer, TileLayer, Marker, Popup, Circle
} from 'react-leaflet';
import L from 'leaflet';
import {
  Flame, MapPin, Droplets, Wind, ThermometerSun,
  AlertTriangle, Phone, Camera, CheckCircle,
  Bell, Waves, Navigation, Hospital, ShieldAlert,
  User, Clock, Send, Upload, Info,
  Activity, Sun, Eye, Layers, RefreshCw
} from 'lucide-react';
import { emergencyService } from '../services/emergencyService';
import { citizenService } from '../services/citizenService';
import { useAppStore } from '../store/store';
import { CoolingCenter, WaterStation, Hospital as HospitalType } from '../types/emergency';
import { getCityById, CITIES } from '../data/cityRegistry';
import { changeApiCity } from '../api/client';
import { weatherService } from '../services/weatherService';

const AIR_QUALITY = 'Moderate';

const RISK_CONFIG = {
  Extreme: { label: 'Extreme', textColor: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', dotColor: 'bg-rose-500', barColor: '#9F1239', gradFrom: 'from-rose-600', gradTo: 'to-rose-900', pct: 95 },
  High:    { label: 'High Risk', textColor: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', dotColor: 'bg-red-500', barColor: '#DC2626', gradFrom: 'from-red-500', gradTo: 'to-orange-600', pct: 75 },
  Moderate:{ label: 'Moderate', textColor: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', dotColor: 'bg-orange-500', barColor: '#F97316', gradFrom: 'from-orange-500', gradTo: 'to-amber-600', pct: 50 },
  Low:     { label: 'Low Risk', textColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', dotColor: 'bg-green-500', barColor: '#16A34A', gradFrom: 'from-green-500', gradTo: 'to-teal-600', pct: 20 },
};
const REPORT_CATEGORIES = [
  { id: 'broken_fountain', label: 'Broken Fountain', icon: '🚰' },
  { id: 'heat_emergency', label: 'Heat Emergency', icon: '🏥' },
  { id: 'no_tree_shade', label: 'No Tree Shade', icon: '🌳' },
  { id: 'cooling_center', label: 'Cooling Center Issue', icon: '🌬️' },
  { id: 'road_heat', label: 'Extreme Road Heat', icon: '🔥' },
  { id: 'other', label: 'Other Issue', icon: '📋' },
];

const SAFETY_TIPS = [
  { icon: '💧', title: 'Stay Hydrated', desc: 'Drink water every 15–20 minutes even if you do not feel thirsty. Carry a water bottle when outdoors.', color: 'border-blue-100 bg-blue-50/60' },
  { icon: '🌡️', title: 'Avoid Peak Heat Hours', desc: 'Stay indoors between 11 AM – 4 PM. Schedule outdoor activities for early morning or after sunset.', color: 'border-orange-100 bg-orange-50/60' },
  { icon: '👕', title: 'Wear Light Clothing', desc: 'Choose light-colored, loose-fitting, breathable clothing. A wide-brimmed hat provides additional protection.', color: 'border-yellow-100 bg-yellow-50/60' },
  { icon: '🧓', title: 'Check on Vulnerable Persons', desc: 'Visit elderly neighbors and those with chronic illness between noon and 4 PM. Heatstroke risk is highest in this group.', color: 'border-purple-100 bg-purple-50/60' },
  { icon: '🚗', title: 'Never Leave Children in Vehicles', desc: 'Car interiors can reach 70°C within minutes. Never leave children or pets unattended in parked vehicles.', color: 'border-red-100 bg-red-50/60' },
  { icon: '🏥', title: 'Know Heatstroke Symptoms', desc: 'Signs include: hot dry skin, rapid pulse, confusion, or loss of consciousness. Call 108 immediately if observed.', color: 'border-rose-100 bg-rose-50/60' },
];

const ALERTS = [
  { id: 1, type: 'Emergency', icon: <ShieldAlert className="w-4 h-4" />, title: 'Red Heatwave Alert', desc: 'BBMP declares Level-3 Red Alert. Avoid outdoor activity till 6 PM.', time: '14:10', color: 'bg-red-50 border-red-200', iconColor: 'text-red-600 bg-red-100', blink: true },
  { id: 2, type: 'Advisory', icon: <AlertTriangle className="w-4 h-4" />, title: 'Government Advisory', desc: 'All outdoor construction work suspended 11 AM – 4 PM per BBMP order.', time: '11:00', color: 'bg-orange-50 border-orange-200', iconColor: 'text-orange-600 bg-orange-100', blink: false },
  { id: 3, type: 'Water Supply', icon: <Droplets className="w-4 h-4" />, title: 'Water Supply Notice', desc: 'Additional water tankers deployed to Whitefield. Dial 1916 for requests.', time: '09:30', color: 'bg-blue-50 border-blue-200', iconColor: 'text-blue-600 bg-blue-100', blink: false },
  { id: 4, type: 'Info', icon: <Info className="w-4 h-4" />, title: 'Cooling Center Update', desc: '2 new emergency cooling centers opened at Shivajinagar Bus Station & Koramangala.', time: '08:00', color: 'bg-green-50 border-green-200', iconColor: 'text-green-600 bg-green-100', blink: false },
];

const EMERGENCY_CONTACTS = [
  { label: 'Ambulance', number: '108', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { label: 'City EOC', number: '1916', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { label: 'Heat Helpline', number: '1800-XXX-HEAT', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { label: 'Fire & Rescue', number: '101', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
];

// Custom Leaflet markers
const makeIcon = (color: string, size = 28) => L.divIcon({
  className: '',
  html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>`,
  iconAnchor: [size / 2, size / 2],
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;background:#3B82F6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.2),0 2px 8px rgba(0,0,0,0.25);animation:pulse 2s infinite;"></div>`,
  iconAnchor: [10, 10],
});

// Map layer toggle hook
const MapLayers: React.FC<{ coolingCenters: CoolingCenter[]; waterStations: WaterStation[]; hospitals: HospitalType[]; overlays: Record<string, boolean>; userLocation: [number, number]; cityCenter: [number, number]; cityName: string }> = ({ coolingCenters, waterStations, hospitals, overlays, userLocation, cityCenter, cityName }) => {
  return (
    <>
      {/* User location */}
      <Marker position={userLocation} icon={userIcon}>
        <Popup><strong>Your Location</strong><br />{cityName}</Popup>
      </Marker>

      {/* Heat circles */}
      {overlays.heat && (
        <>
          <Circle center={[cityCenter[0] - 0.009, cityCenter[1] + 0.145]} radius={1800} pathOptions={{ color: '#DC2626', fillColor: '#DC2626', fillOpacity: 0.18, weight: 1.5 }} />
          <Circle center={[cityCenter[0] + 0.011, cityCenter[1] + 0.005]} radius={1200} pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.14, weight: 1.5 }} />
          <Circle center={[cityCenter[0] - 0.001, cityCenter[1] + 0.048]} radius={1000} pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.12, weight: 1 }} />
          <Circle center={[cityCenter[0] - 0.039, cityCenter[1] + 0.028]} radius={900}  pathOptions={{ color: '#FACC15', fillColor: '#FACC15', fillOpacity: 0.10, weight: 1 }} />
        </>
      )}

      {/* Cooling centers */}
      {overlays.cooling && coolingCenters.map(cc => (
        <Marker key={cc.id} position={cc.coordinates} icon={makeIcon('#0EA5E9')}>
          <Popup>
            <strong>{cc.name}</strong><br />
            Capacity: {cc.currentOccupancy}/{cc.capacity}<br />
            Status: {cc.acStatus}
          </Popup>
        </Marker>
      ))}

      {/* Water stations */}
      {overlays.water && waterStations.map(ws => (
        <Marker key={ws.id} position={ws.coordinates} icon={makeIcon('#06B6D4', 22)}>
          <Popup>
            <strong>{ws.name}</strong><br />
            Type: {ws.type}<br />
            Status: {ws.status}
          </Popup>
        </Marker>
      ))}

      {/* Hospitals */}
      {overlays.hospitals && hospitals.map(h => (
        <Marker key={h.id} position={h.coordinates} icon={makeIcon('#DC2626', 24)}>
          <Popup>
            <strong>{h.name}</strong><br />
            Status: {h.status}<br />
            Beds: {h.occupiedBeds}/{h.capacity}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

// ── Main Component
const CitizenPortal: React.FC = () => {
  const navigate = useNavigate();
  const setRole = useAppStore((s) => s.setRole);
  const selectedCityId = useAppStore((s) => s.selectedCity);
  const setCity = useAppStore((s) => s.setCity);
  
  const city = getCityById(selectedCityId) || CITIES[0];
  const userLocation: [number, number] = [city.coordinates[0] + 0.005, city.coordinates[1] + 0.005];

  const queryClient = useQueryClient();
  const reportRef = useRef<HTMLDivElement>(null);

  const [reportCategory, setReportCategory] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLocation, setReportLocation] = useState(`Central ${city.name}`);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [overlays, setOverlays] = useState({
    heat: true, cooling: true, water: true, hospitals: true, trees: false,
  });
  const [activeResourceTab, setActiveResourceTab] = useState<'cooling' | 'water' | 'hospitals'>('cooling');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch live weather
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['liveWeather', city.id],
    queryFn: () => weatherService.getLiveWeather(city.coordinates[0], city.coordinates[1]),
    refetchInterval: 300000, // 5 mins
  });

  const HEAT_INDEX = weatherLoading ? '--' : (weather?.feelsLike ?? 46.1);
  const AIR_TEMP = weatherLoading ? '--' : (weather?.temperature ?? 42.3);
  const HUMIDITY = weatherLoading ? '--' : (weather?.humidity ?? 38);
  const UV_INDEX = weatherLoading ? '--' : (weather?.uvIndex ?? 9);
  
  const riskLevel = weatherLoading ? 'High' : HEAT_INDEX === '--' ? 'High' : (HEAT_INDEX as number) >= 43 ? 'Extreme' : (HEAT_INDEX as number) >= 40 ? 'High' : (HEAT_INDEX as number) >= 37 ? 'Moderate' : 'Low';
  const risk = RISK_CONFIG[riskLevel as keyof typeof RISK_CONFIG];

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    changeApiCity(newCity);
    queryClient.invalidateQueries();
  };

  const { data: wsResp, isLoading: wsLoading } = useQuery({
    queryKey: ['waterStations'],
    queryFn: emergencyService.getWaterStations,
  });

  const { data: hospitalsResp } = useQuery({
    queryKey: ['hospitals'],
    queryFn: emergencyService.getHospitals,
  });

  const { data: reportsResp } = useQuery({
    queryKey: ['citizenReports'],
    queryFn: citizenService.getReports,
  });

  const coolingCenters = wsResp?.data.coolingCenters ?? [];
  const waterStations  = wsResp?.data.waterStations ?? [];
  const hospitals      = hospitalsResp?.data ?? [];
  const reports        = reportsResp?.data ?? [];

  const submitMutation = useMutation({
    mutationFn: citizenService.submitReport,
    onSuccess: () => {
      setReportSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['citizenReports'] });
      setTimeout(() => {
        setReportSubmitted(false);
        setReportCategory('');
        setReportDesc('');
      }, 3000);
    },
  });

  const handleSubmitReport = () => {
    if (!reportCategory) return;
    submitMutation.mutate({
      category: REPORT_CATEGORIES.find(c => c.id === reportCategory)?.label ?? reportCategory,
      description: reportDesc,
      severity: reportCategory === 'heat_emergency' ? 'Critical' : 'Medium',
      coordinates: userLocation,
      wardId: 'ward-1',
    });
  };

  const handleLogout = () => { setRole(null); navigate('/'); };

  const toggleOverlay = (key: keyof typeof overlays) =>
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));

  const scrollToReport = () => reportRef.current?.scrollIntoView({ behavior: 'smooth' });

  // ── RESOURCE CARDS helper
  const renderResourceCards = () => {
    if (activeResourceTab === 'cooling') {
      return coolingCenters.map(cc => {
        const pct = Math.round((cc.currentOccupancy / cc.capacity) * 100);
        return (
          <div key={cc.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-blue-50 p-3 rounded-xl"><Waves className="w-5 h-5 text-blue-500" /></div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${pct > 90 ? 'bg-red-50 text-red-600 border-red-200' : pct > 70 ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                {pct > 90 ? 'Nearly Full' : pct > 70 ? 'Filling Up' : 'Available'}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1 leading-tight">{cc.name}</h4>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
              <motion.div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-orange-400' : 'bg-blue-500'}`}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
            </div>
            <p className="text-xs text-slate-400 mb-3">{cc.currentOccupancy}/{cc.capacity} people · {cc.acStatus} · 💧 {cc.waterAvailableLiters.toLocaleString()}L</p>
            <button
              onClick={() => {
                const [lat, lng] = cc.coordinates;
                const [uLat, uLng] = userLocation;
                window.open(
                  `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLng}&destination=${lat},${lng}&travelmode=walking`,
                  '_blank'
                );
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 group-hover:gap-2.5 transition-all"
            >
              <Navigation className="w-3.5 h-3.5" /> Get Directions
            </button>
          </div>
        );
      });
    }
    if (activeResourceTab === 'water') {
      return waterStations.map(ws => (
        <div key={ws.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-cyan-50 p-3 rounded-xl"><Droplets className="w-5 h-5 text-cyan-500" /></div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ws.status === 'Operational' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
              {ws.status}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mb-1">{ws.name}</h4>
          <p className="text-xs text-slate-400 mb-3">{ws.type} · Flow: <strong className={ws.flowRate === 'Low' ? 'text-yellow-600' : 'text-cyan-600'}>{ws.flowRate}</strong> · {ws.dailyUsageLiters.toLocaleString()}L served today</p>
          <button
            onClick={() => {
              const [lat, lng] = ws.coordinates;
              const [uLat, uLng] = userLocation;
              window.open(
                `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLng}&destination=${lat},${lng}&travelmode=walking`,
                '_blank'
              );
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-cyan-600 hover:text-cyan-700 group-hover:gap-2.5 transition-all"
          >
            <Navigation className="w-3.5 h-3.5" /> Get Directions
          </button>
        </div>
      ));
    }
    if (activeResourceTab === 'hospitals') {
      return hospitals.map(h => {
        const STATUS_STYLE: Record<string, string> = {
          Optimal: 'bg-green-50 text-green-600 border-green-200',
          Stable: 'bg-orange-50 text-orange-600 border-orange-200',
          Critical: 'bg-red-50 text-red-600 border-red-200',
          Emergency: 'bg-rose-50 text-rose-700 border-rose-200',
        };
        return (
          <div key={h.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-red-50 p-3 rounded-xl"><Hospital className="w-5 h-5 text-red-500" /></div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[h.status] ?? STATUS_STYLE.Stable}`}>{h.status}</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1 leading-tight">{h.name}</h4>
            <p className="text-xs text-slate-400 mb-1">Beds: {h.occupiedBeds}/{h.capacity}</p>
            <p className="text-xs text-slate-400 mb-3">Heatstroke: {h.heatstrokeBedsOccupied}/{h.heatstrokeBedsTotal} · Ambulance: {h.ambulanceDispatched}/{h.ambulanceTotal}</p>
            <button
              onClick={() => {
                const [lat, lng] = h.coordinates;
                const [uLat, uLng] = userLocation;
                window.open(
                  `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLng}&destination=${lat},${lng}&travelmode=driving`,
                  '_blank'
                );
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 group-hover:gap-2.5 transition-all"
            >
              <Navigation className="w-3.5 h-3.5" /> Get Directions
            </button>
          </div>
        );
      });
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">

      {/* ── TOP NAVBAR ── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl shadow-sm">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-bold text-slate-900">UrbanHeatX <span className="text-orange-500">AI</span></span>
                <p className="text-[10px] text-slate-400 -mt-0.5">Citizen Portal</p>
              </div>
            </button>

            {/* Location & City Switcher */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">{reportLocation}</span>
              </div>
              <select
                value={selectedCityId}
                onChange={handleCitySelect}
                className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-2 py-2 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                {CITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Center: Live status */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ThermometerSun className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-slate-900">{HEAT_INDEX}°C</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${risk.bgColor} ${risk.textColor} ${risk.borderColor}`}>
              <span className={`w-2 h-2 rounded-full ${risk.dotColor} animate-pulse`} />
              {risk.label}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="heading-h3">Notifications</h3>
                    </div>
                    {ALERTS.slice(0, 3).map(a => (
                      <div key={a.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-semibold text-slate-800">{a.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{a.desc.substring(0, 60)}...</p>
                        <p className="text-[10px] text-slate-400 mt-1">{a.time} today</p>
                      </div>
                    ))}
                    <div className="p-3 text-center">
                      <button className="text-xs text-orange-500 font-medium hover:text-orange-600">View All Alerts</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">

        {/* ── HERO SECTION ── */}
        <section>
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${risk.gradFrom} ${risk.gradTo} p-8 md:p-10 shadow-xl`}>
            {/* Animated blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                  </span>
                  <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">Live Heat Index</span>
                </div>
                <div className="flex items-end gap-4 mb-3">
                  <span className="text-7xl md:text-8xl font-black text-white leading-none">{HEAT_INDEX}</span>
                  <div className="pb-2">
                    <span className="text-3xl font-bold text-white/80">°C</span>
                    <p className="text-white/70 text-sm font-semibold mt-1">{risk.label}</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm mb-5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {reportLocation}, {city.name}
                </p>

                {/* Stat row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: <ThermometerSun className="w-4 h-4" />, label: 'Air Temp', val: `${AIR_TEMP}°C` },
                    { icon: <Droplets className="w-4 h-4" />, label: 'Humidity', val: `${HUMIDITY}%` },
                    { icon: <Sun className="w-4 h-4" />, label: 'UV Index', val: `${UV_INDEX} / Very High` },
                    { icon: <Wind className="w-4 h-4" />, label: 'Air Quality', val: AIR_QUALITY },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-white/60 mb-1">{s.icon}<span className="text-[10px] font-semibold uppercase tracking-wider">{s.label}</span></div>
                      <p className="text-sm font-bold text-white">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — AI Recommendation */}
              <div className="flex flex-col justify-between">
                <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-6 flex-1 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">AI Safety Recommendation</span>
                  </div>
                  <p className="text-white/85 text-sm leading-relaxed mb-4">
                    Current temperature of <strong>{HEAT_INDEX}°C</strong> exceeds the critical heatstroke threshold. 
                    Outdoor exposure is strongly discouraged. Seek a cooling center or remain indoors with ventilation active. 
                    Consume a minimum of 3–4 liters of water today.
                  </p>
                  <div className="space-y-2">
                    {['Do not exercise outdoors before 6 PM', 'Carry ORS sachets if you must go out', 'Call 108 immediately if feeling dizzy'].map(tip => (
                      <div key={tip} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-white/70 shrink-0 mt-0.5" />
                        <span className="text-white/75 text-xs">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <a href="tel:108" className="flex-1 flex items-center justify-center gap-2 bg-white text-red-600 font-semibold text-sm py-3 rounded-xl hover:bg-red-50 transition-colors shadow-sm">
                    <Phone className="w-4 h-4" /> Emergency 108
                  </a>
                  <button onClick={scrollToReport} className="flex-1 flex items-center justify-center gap-2 bg-white/15 border border-white/25 text-white font-semibold text-sm py-3 rounded-xl hover:bg-white/20 transition-colors">
                    <Camera className="w-4 h-4" /> Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUICK ACTIONS ── */}
        <section>
          <h2 className="heading-h2">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: <Waves className="w-6 h-6" />, label: 'Cooling Centers', count: `${coolingCenters.length} Open`, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100', action: () => setActiveResourceTab('cooling') },
              { icon: <Droplets className="w-6 h-6" />, label: 'Water Stations', count: `${waterStations.filter(w => w.status === 'Operational').length} Active`, color: 'text-cyan-600', bg: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-100', action: () => setActiveResourceTab('water') },
              { icon: <Phone className="w-6 h-6" />, label: 'Emergency', count: 'Call 108', color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100 border-red-100', action: () => {} },
              { icon: <Camera className="w-6 h-6" />, label: 'Report Issue', count: 'Submit Now', color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100 border-orange-100', action: scrollToReport },
              { icon: <Layers className="w-6 h-6" />, label: 'Live Heat Map', count: 'View Map', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100 border-purple-100', action: () => {} },
            ].map((item, i) => (
              <motion.button
                key={item.label}
                onClick={item.action}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`${item.bg} border rounded-2xl p-5 text-left transition-all shadow-sm hover:shadow-md flex flex-col gap-3 cursor-pointer`}
              >
                <div className={`${item.color}`}>{item.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                  <p className={`text-xs font-medium ${item.color} mt-0.5`}>{item.count}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── INTERACTIVE MAP ── */}
        <section>
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            {/* Map header */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="heading-h2 mb-1">Live Urban Heat Map</h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time overlay · {city.name} boundaries</p>
              </div>
              {/* Layer toggles */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'heat', label: 'Heat Zones', color: 'bg-red-500' },
                  { key: 'cooling', label: 'Cooling', color: 'bg-blue-500' },
                  { key: 'water', label: 'Water', color: 'bg-cyan-500' },
                  { key: 'hospitals', label: 'Hospitals', color: 'bg-rose-600' },
                ].map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => toggleOverlay(key as keyof typeof overlays)}
                    className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
                      overlays[key as keyof typeof overlays]
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${overlays[key as keyof typeof overlays] ? 'bg-white' : color}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="h-[480px] w-full">
              <MapContainer
                key={city.id} // forces remount on city change
                center={city.coordinates}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapLayers
                  coolingCenters={coolingCenters}
                  waterStations={waterStations}
                  hospitals={hospitals}
                  overlays={overlays}
                  userLocation={userLocation}
                  cityCenter={city.coordinates}
                  cityName={city.name}
                />
              </MapContainer>
            </div>

            {/* Map legend */}
            <div className="px-6 py-3 border-t border-slate-100 flex flex-wrap items-center gap-5 bg-slate-50/50">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">Legend</span>
              {[
                { color: 'bg-blue-500', label: 'You' },
                { color: 'bg-red-500/60', label: 'Heat Zone' },
                { color: 'bg-blue-400', label: 'Cooling Center' },
                { color: 'bg-cyan-400', label: 'Water Station' },
                { color: 'bg-rose-600', label: 'Hospital' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full ${color} shrink-0`} />
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEARBY RESOURCES ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-h2 mb-0">Nearby Resources</h2>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {(['cooling', 'water', 'hospitals'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveResourceTab(tab)}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors capitalize ${
                    activeResourceTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'cooling' ? 'Cooling' : tab === 'water' ? 'Water' : 'Hospitals'}
                </button>
              ))}
            </div>
          </div>
          {wsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-100 h-36 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {renderResourceCards()}
            </div>
          )}
        </section>

        {/* ── SAFETY TIPS ── */}
        <section>
          <div className="mb-5">
            <h2 className="heading-h2 mb-1">AI Safety Guidance</h2>
            <p className="text-xs text-slate-400">Generated for current heat conditions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {SAFETY_TIPS.map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`border rounded-2xl p-5 ${tip.color} hover:shadow-sm transition-all`}
              >
                <h3 className="heading-h3">{tip.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── ALERTS TIMELINE ── */}
        <section>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Alerts */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="heading-h2 mb-0">Alerts Timeline</h2>
              </div>
              <div className="space-y-4">
                {ALERTS.map((alert, i) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex gap-4 p-4 rounded-xl border ${alert.color}`}
                  >
                    <div className={`${alert.iconColor} p-2.5 rounded-xl shrink-0 flex items-center justify-center`}>
                      {alert.icon}
                      {alert.blink && <span className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{alert.title}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                          <Clock className="w-3 h-3" /> {alert.time}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{alert.desc}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{alert.type}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="heading-h2 mb-0">Emergency Contacts</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {EMERGENCY_CONTACTS.map((c) => (
                  <a
                    key={c.label}
                    href={`tel:${c.number}`}
                    className={`flex items-center gap-3 p-4 rounded-xl border ${c.bg} hover:scale-[1.01] transition-transform`}
                  >
                    <Phone className={`w-5 h-5 ${c.color} shrink-0`} />
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">{c.label}</p>
                      <p className={`text-lg font-bold ${c.color}`}>{c.number}</p>
                    </div>
                  </a>
                ))}
              </div>
              {/* Heatstroke steps */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-bold text-red-700 mb-2">🆘 If Someone is Having Heatstroke</p>
                <ol className="space-y-1">
                  {['Call 108 immediately', 'Move to cool, shaded area', 'Apply cold wet cloth to neck, armpits, groin', 'Do NOT give water if unconscious'].map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                      <span className="font-bold shrink-0">{i + 1}.</span>{s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ── CITIZEN REPORTING ── */}
        <section ref={reportRef}>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Report Form */}
            <div className="xl:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="heading-h2 mb-1">Report a Heat Issue</h2>
                <p className="text-xs text-slate-400">Help the city respond faster to heat-related problems</p>
              </div>

              <AnimatePresence mode="wait">
                {reportSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="bg-green-50 p-5 rounded-full mb-4">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="heading-h3 justify-center mb-1 before:bg-green-500 text-green-700">Report Submitted!</h3>
                    <p className="text-sm text-slate-400">Our emergency team has been notified and will respond shortly.</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Category */}
                    <div className="mb-5">
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">Issue Type <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {REPORT_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setReportCategory(cat.id)}
                            className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-colors ${
                              reportCategory === cat.id ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <span className="text-xl">{cat.icon}</span>
                            <span className="text-xs font-semibold leading-tight">{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-5">
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">Description</label>
                      <textarea
                        value={reportDesc}
                        onChange={e => setReportDesc(e.target.value)}
                        placeholder="Describe what you are observing. Be as specific as possible — it helps our response team act faster."
                        rows={4}
                        className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Location */}
                    <div className="mb-5">
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={reportLocation}
                          onChange={e => setReportLocation(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="mb-6">
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">Upload Photo (Optional)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer">
                        <Upload className="w-7 h-7 text-slate-300" />
                        <p className="text-sm text-slate-400">Drag & drop or click to upload</p>
                        <p className="text-xs text-slate-300">PNG, JPG up to 10MB</p>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitReport}
                      disabled={!reportCategory || submitMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      {submitMutation.isPending ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Submit Report</>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Previous Reports */}
            <div className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="heading-h2 mb-0">Recent Reports</h2>
              </div>
              <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-[520px]">
                {reports.map(r => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border transition-all ${
                      r.severity === 'Critical' ? 'bg-red-50 border-red-100' :
                      r.severity === 'High' ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-800">{r.category}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        r.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                        r.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                      }`}>{r.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">{r.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      <span className={`font-semibold ${r.severity === 'Critical' ? 'text-red-500' : r.severity === 'High' ? 'text-orange-500' : 'text-slate-400'}`}>{r.severity}</span>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No reports submitted yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-slate-100 mt-12">
        <div className="max-w-screen-2xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-900">UrbanHeatX <span className="text-orange-500">AI</span></span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">AI-powered urban heat intelligence platform for smarter cities and safer citizens.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Emergency Contacts</h4>
              {[{ l: 'Ambulance', n: '108' }, { l: 'City EOC', n: '1916' }, { l: 'Fire & Rescue', n: '101' }].map(c => (
                <a key={c.l} href={`tel:${c.n}`} className="flex justify-between text-xs text-slate-500 hover:text-orange-500 transition-colors mb-1.5">
                  <span>{c.l}</span><strong>{c.n}</strong>
                </a>
              ))}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Platform</h4>
              {['Commissioner Portal', 'Emergency Operations', 'Heat Risk API', 'City Data'].map(l => (
                <p key={l} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer mb-1.5">{l}</p>
              ))}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Legal & Support</h4>
              {['Privacy Policy', 'Terms of Service', 'Data Sources', 'Support Center'].map(l => (
                <p key={l} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer mb-1.5">{l}</p>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">© 2026 UrbanHeatX AI · Bengaluru Urban Heat Monitoring System</p>
            <p className="text-xs text-slate-400">Data refreshes every 15 minutes · Built for Smart City governance</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CitizenPortal;
