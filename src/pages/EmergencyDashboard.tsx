import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  ShieldAlert, Ambulance, Droplets, Activity,
  AlertTriangle, MapPin, Hospital, Waves, LogOut,
  Clock, Radio, Phone, Flame
} from 'lucide-react';
import { emergencyService } from '../services/emergencyService';
import { useAppStore } from '../store/store';
import { Hospital as HospitalType } from '../types/emergency';

const STATUS_COLORS: Record<string, string> = {
  Optimal: '#16A34A',
  Stable: '#F97316',
  Critical: '#DC2626',
  Emergency: '#9F1239',
};

const STATUS_BG: Record<string, string> = {
  Optimal: 'bg-green-900/40 text-green-400 border-green-800',
  Stable: 'bg-orange-900/40 text-orange-400 border-orange-800',
  Critical: 'bg-red-900/40 text-red-400 border-red-800',
  Emergency: 'bg-rose-950/60 text-rose-300 border-rose-800',
};

const LIVE_ALERTS = [
  { id: 1, level: 'Critical', msg: 'Heat stroke case reported — Whitefield Industrial Zone', time: '14:52', ward: 'Whitefield' },
  { id: 2, level: 'High', msg: 'Water tanker reorder needed — Shivajinagar Bus Station', time: '14:45', ward: 'Shivajinagar' },
  { id: 3, level: 'Critical', msg: 'Hospital bed capacity at 97% — Whitefield General', time: '14:38', ward: 'Whitefield' },
  { id: 4, level: 'Medium', msg: 'Cooling center near capacity — Indiranagar Library', time: '14:30', ward: 'Indiranagar' },
  { id: 5, level: 'High', msg: 'Misting fan malfunction — Koramangala transit hub', time: '14:22', ward: 'Koramangala' },
  { id: 6, level: 'Critical', msg: '3 heatstroke fatalities confirmed — Metro area', time: '14:10', ward: 'City Wide' },
];

const TIMELINE = [
  { time: '06:00', event: 'Heat Advisory Level 3 issued citywide', type: 'warning' },
  { time: '08:30', event: 'All 5 cooling centers activated', type: 'action' },
  { time: '10:15', event: 'First heatstroke case admitted — Apollo Indiranagar', type: 'incident' },
  { time: '11:40', event: '8 ambulances deployed to high-risk zones', type: 'action' },
  { time: '13:00', event: 'Grid load crossed 90% — power conservation order', type: 'warning' },
  { time: '14:10', event: 'Emergency Orange Alert upgraded to Red', type: 'incident' },
  { time: '14:52', event: 'Mass water tanker deployment to Whitefield', type: 'action' },
];

const BlinkDot: React.FC<{ color?: string }> = ({ color = 'bg-red-500' }) => (
  <span className="relative flex h-2.5 w-2.5">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
    <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
  </span>
);

const EmergencyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const setRole = useAppStore((s) => s.setRole);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedHospital, setSelectedHospital] = useState<HospitalType | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: hospitalsResp, isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: emergencyService.getHospitals,
    refetchInterval: 30000,
  });

  const { data: wsResp } = useQuery({
    queryKey: ['waterStations'],
    queryFn: emergencyService.getWaterStations,
  });

  const hospitals = hospitalsResp?.data ?? [];
  const coolingCenters = wsResp?.data.coolingCenters ?? [];
  const waterStations = wsResp?.data.waterStations ?? [];

  const totalAmbDispatched = hospitals.reduce((s, h) => s + h.ambulanceDispatched, 0);
  const totalAmbTotal = hospitals.reduce((s, h) => s + h.ambulanceTotal, 0);
  const criticalHospitals = hospitals.filter(h => h.status === 'Critical' || h.status === 'Emergency').length;
  const totalHeatstrokeBeds = hospitals.reduce((s, h) => s + h.heatstrokeBedsOccupied, 0);
  const totalHeatstrokeCap = hospitals.reduce((s, h) => s + h.heatstrokeBedsTotal, 0);
  const totalCoolingCapacity = coolingCenters.reduce((s, c) => s + c.capacity, 0);
  const totalCoolingOccupied = coolingCenters.reduce((s, c) => s + c.currentOccupancy, 0);

  const hospitalChartData = hospitals.map(h => ({
    name: h.name.split(' ').slice(0, 2).join(' '),
    occupied: Math.round((h.heatstrokeBedsOccupied / h.heatstrokeBedsTotal) * 100),
    available: Math.round(((h.heatstrokeBedsTotal - h.heatstrokeBedsOccupied) / h.heatstrokeBedsTotal) * 100),
  }));

  const handleLogout = () => {
    setRole(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col overflow-hidden">
      {/* Top Command Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">UrbanHeatX <span className="text-red-400">AI</span></span>
              <p className="text-[10px] text-slate-500">Emergency Operations Center</p>
            </div>
          </div>

          {/* Live Time */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm font-mono font-semibold text-slate-200">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Heatwave Level */}
          <motion.div
            className="flex items-center gap-2 bg-red-950 border border-red-800 rounded-xl px-4 py-2"
            animate={{ borderColor: ['#991B1B', '#DC2626', '#991B1B'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <BlinkDot />
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Level-3 Red Alert</span>
          </motion.div>

          {/* Radio signal */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2">
            <Radio className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">LIVE</span>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-2">
            <LogOut className="w-3.5 h-3.5" />
            Exit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">

        {/* === SECTION 1: Critical Metrics === */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Ambulances Active',
              value: `${totalAmbDispatched}/${totalAmbTotal}`,
              icon: <Ambulance className="w-5 h-5" />,
              color: 'text-red-400',
              bg: 'bg-red-950/50 border-red-900',
              pct: (totalAmbDispatched / totalAmbTotal) * 100,
              pctColor: 'bg-red-500',
            },
            {
              label: 'Heatstroke Beds',
              value: `${totalHeatstrokeBeds}/${totalHeatstrokeCap}`,
              icon: <Hospital className="w-5 h-5" />,
              color: 'text-orange-400',
              bg: 'bg-orange-950/50 border-orange-900',
              pct: (totalHeatstrokeBeds / totalHeatstrokeCap) * 100,
              pctColor: 'bg-orange-500',
            },
            {
              label: 'Cooling Centers',
              value: `${totalCoolingOccupied}/${totalCoolingCapacity}`,
              icon: <Waves className="w-5 h-5" />,
              color: 'text-blue-400',
              bg: 'bg-blue-950/50 border-blue-900',
              pct: (totalCoolingOccupied / totalCoolingCapacity) * 100,
              pctColor: 'bg-blue-500',
            },
            {
              label: 'Critical Hospitals',
              value: `${criticalHospitals}/${hospitals.length}`,
              icon: <ShieldAlert className="w-5 h-5" />,
              color: 'text-rose-400',
              bg: 'bg-rose-950/50 border-rose-900',
              pct: (criticalHospitals / Math.max(hospitals.length, 1)) * 100,
              pctColor: 'bg-rose-500',
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              className={`${item.bg} border rounded-2xl p-4`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${item.color}`}>{item.icon}</div>
                {item.pct > 85 && <BlinkDot />}
              </div>
              <p className="text-2xl font-bold text-white mb-1">{item.value}</p>
              <p className="text-xs text-slate-400 mb-2">{item.label}</p>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${item.pctColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* === SECTION 2: Hospital Grid + Live Alerts === */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Hospital Status */}
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Hospital className="w-4 h-4 text-orange-400" />
              <h2 className="heading-h2 text-white border-red-500 mb-0">Hospital Capacity Monitor</h2>
              <BlinkDot color="bg-orange-500" />
            </div>
            <div className="space-y-3">
              {isLoading ? (
                Array(4).fill(null).map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-800 h-16 rounded-xl" />
                ))
              ) : (
                hospitals.map((h) => {
                  const bedPct = Math.round((h.heatstrokeBedsOccupied / h.heatstrokeBedsTotal) * 100);
                  return (
                    <motion.div
                      key={h.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                        selectedHospital?.id === h.id ? 'bg-slate-700 border-slate-600' : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800'
                      }`}
                      onClick={() => setSelectedHospital(h === selectedHospital ? null : h)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${STATUS_BG[h.status]}`}>{h.status}</span>
                          <span className="text-xs font-medium text-slate-300 truncate">{h.name}</span>
                          {(h.status === 'Emergency' || h.status === 'Critical') && <BlinkDot />}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: STATUS_COLORS[h.status] }}
                              initial={{ width: 0 }}
                              animate={{ width: `${bedPct}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">{bedPct}% used</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">Ambulance</p>
                        <p className="text-sm font-bold text-white">{h.ambulanceDispatched}/{h.ambulanceTotal}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Hospital detail */}
            <AnimatePresence>
              {selectedHospital && (
                <motion.div
                  className="mt-4 bg-slate-800 border border-slate-700 rounded-xl p-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Total Beds', val: selectedHospital.capacity },
                      { label: 'Occupied', val: selectedHospital.occupiedBeds },
                      { label: 'HS Beds', val: `${selectedHospital.heatstrokeBedsOccupied}/${selectedHospital.heatstrokeBedsTotal}` },
                    ].map((s) => (
                      <div key={s.label} className="bg-slate-900 rounded-lg p-2">
                        <p className="text-lg font-bold text-white">{s.val}</p>
                        <p className="text-[10px] text-slate-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-slate-300">Water Tanker: <strong className="text-blue-300">{selectedHospital.waterTankerStatus}</strong></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live Alerts Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="heading-h2 text-white border-red-500 mb-0">Live Critical Alerts</h2>
              <BlinkDot />
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
              {LIVE_ALERTS.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`p-3 rounded-xl border ${
                    alert.level === 'Critical'
                      ? 'bg-red-950/40 border-red-900/60'
                      : alert.level === 'High'
                      ? 'bg-orange-950/40 border-orange-900/60'
                      : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {alert.level === 'Critical' && <BlinkDot />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          alert.level === 'Critical' ? 'text-red-400' : alert.level === 'High' ? 'text-orange-400' : 'text-slate-400'
                        }`}>
                          {alert.level}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{alert.msg}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-500" />
                        <span className="text-[10px] text-slate-500">{alert.ward}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* === SECTION 3: Hospital Chart + Timeline === */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Hospital bed chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-orange-400" />
              <h2 className="heading-h2 text-white border-red-500 mb-0">Heatstroke Bed Utilization (%)</h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hospitalChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, background: '#0F172A', border: '1px solid #1E293B', fontSize: 11, color: '#E2E8F0' }} />
                <Bar dataKey="occupied" name="Occupied %" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available %" fill="#1E293B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Emergency Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-blue-400" />
              <h2 className="heading-h2 text-white border-red-500 mb-0">Emergency Timeline Today</h2>
            </div>
            <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-52">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 pt-0.5 w-10">{item.time}</span>
                  <div className="flex items-start gap-2 flex-1">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      item.type === 'incident' ? 'bg-red-500' : item.type === 'warning' ? 'bg-orange-400' : 'bg-green-500'
                    }`} />
                    <p className="text-xs text-slate-300 leading-relaxed">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === SECTION 4: Cooling Centers + Water Stations === */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Cooling Centers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Waves className="w-4 h-4 text-blue-400" />
              <h2 className="heading-h2 text-white border-red-500 mb-0">Cooling Centers Status</h2>
            </div>
            <div className="space-y-3">
              {coolingCenters.map((cc) => {
                const pct = Math.round((cc.currentOccupancy / cc.capacity) * 100);
                const isCritical = pct > 90;
                return (
                  <div key={cc.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-slate-200 truncate flex-1">{cc.name}</p>
                      {isCritical && <BlinkDot />}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${isCritical ? 'bg-red-500' : pct > 70 ? 'bg-orange-500' : 'bg-blue-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{cc.currentOccupancy}/{cc.capacity}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-blue-400">💧 {cc.waterAvailableLiters.toLocaleString()}L water</span>
                      <span className="text-[10px] text-slate-500">{cc.acStatus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Water Stations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-4 h-4 text-blue-400" />
              <h2 className="heading-h2 text-white border-red-500 mb-0">Water Station Network</h2>
            </div>
            <div className="space-y-3">
              {waterStations.map((ws) => (
                <div key={ws.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-slate-200 truncate flex-1">{ws.name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      ws.status === 'Operational' ? 'bg-green-900/40 text-green-400 border-green-800'
                        : ws.status === 'Maintenance' ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800'
                        : 'bg-red-900/40 text-red-400 border-red-800'
                    }`}>{ws.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span>Type: {ws.type}</span>
                    <span>Flow: <strong className={ws.flowRate === 'Low' ? 'text-yellow-400' : 'text-blue-400'}>{ws.flowRate}</strong></span>
                    <span>{ws.dailyUsageLiters.toLocaleString()}L/day</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-semibold text-white">Emergency Hotlines</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'City EOC', number: '1916', color: 'text-red-400' },
              { label: 'Ambulance', number: '108', color: 'text-orange-400' },
              { label: 'Fire & Rescue', number: '101', color: 'text-yellow-400' },
              { label: 'Heat Helpline', number: '1800-XXX', color: 'text-blue-400' },
            ].map((c) => (
              <div key={c.label} className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                <Phone className={`w-4 h-4 ${c.color} shrink-0`} />
                <div>
                  <p className="text-[10px] text-slate-400">{c.label}</p>
                  <p className={`text-base font-bold ${c.color}`}>{c.number}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default EmergencyDashboard;
