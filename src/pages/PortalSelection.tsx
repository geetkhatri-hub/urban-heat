import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Shield, Smartphone, Activity, MapPin } from 'lucide-react';
import { useAppStore } from '../store/store';
import { CITIES } from '../data/cityRegistry';
import { changeApiCity } from '../api/client';

const PORTALS = [
  {
    id: 'commissioner',
    role: 'commissioner' as const,
    icon: <Activity className="w-7 h-7" />,
    title: 'Municipal Commissioner',
    subtitle: 'Strategic Command',
    description: 'Access city-wide heat intelligence, AI policy recommendations, budget planning, and ward-level risk analytics.',
    tags: ['AI Recommendations', 'Budget Planning', 'Ward Analytics'],
    route: '/commissioner',
    accent: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-50 text-orange-600',
    border: 'hover:border-orange-200',
    tagBg: 'bg-orange-50 text-orange-600',
  },
  {
    id: 'emergency',
    role: 'emergency' as const,
    icon: <Shield className="w-7 h-7" />,
    title: 'Emergency Response',
    subtitle: 'Operations Center',
    description: 'Real-time incident tracking, hospital capacity, ambulance deployment, and live heatwave emergency protocols.',
    tags: ['Live Incidents', 'Hospital Status', 'Resource Deploy'],
    route: '/emergency',
    accent: 'from-red-600 to-red-700',
    iconBg: 'bg-red-50 text-red-600',
    border: 'hover:border-red-200',
    tagBg: 'bg-red-50 text-red-600',
  },
  {
    id: 'citizen',
    role: 'citizen' as const,
    icon: <Smartphone className="w-7 h-7" />,
    title: 'Citizen Portal',
    subtitle: 'Public Access',
    description: 'Check your local heat risk, find nearby cooling centers, water stations, and report heat-related emergencies.',
    tags: ['Heat Index', 'Cooling Centers', 'Report Issues'],
    route: '/citizen',
    accent: 'from-green-600 to-green-700',
    iconBg: 'bg-green-50 text-green-600',
    border: 'hover:border-green-200',
    tagBg: 'bg-green-50 text-green-600',
  },
];

const SmartCityIllustration: React.FC = () => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
    <img 
      src="/smart_city_hero.jpg" 
      alt="UrbanHeatX AI Smart City" 
      className="w-full h-full object-cover rounded-2xl shadow-2xl"
    />
  </div>
);

const PortalSelection: React.FC = () => {
  const navigate = useNavigate();
  const setRole = useAppStore((s) => s.setRole);
  const selectedCity = useAppStore((s) => s.selectedCity);
  const setCity = useAppStore((s) => s.setCity);

  const handleCitySelect = (cityId: string) => {
    setCity(cityId);
    changeApiCity(cityId);
  };

  const handlePortalSelect = (portal: (typeof PORTALS)[0]) => {
    setRole(portal.role);
    navigate(portal.route);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Top bar */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl shadow-sm">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              UrbanHeat<span className="text-orange-500">X</span> AI
            </span>
            <p className="text-xs text-slate-400 -mt-0.5">Smart City Heat Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs text-slate-500 font-medium">Live System</span>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left Side */}
        <div className="flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-widest">AI-Powered Platform</span>
            </div>

            <h1 className="heading-h1 text-4xl lg:text-5xl mb-4">
              AI Powered Urban<br />
              <span className="text-orange-500">Heat Intelligence</span><br />
              Platform
            </h1>

            <div className="flex flex-wrap gap-3 mb-6">
              {['Monitor', 'Predict', 'Mitigate'].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-sm font-semibold text-slate-600 bg-slate-100 px-4 py-1.5 rounded-full"
                >
                  {word}
                </motion.span>
              ))}
              <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full">Urban Heat</span>
            </div>

            <p className="text-slate-500 text-base leading-relaxed max-w-md">
              Monitor urban heat islands. Predict heatwaves with satellite imagery and AI. 
              Protect citizens. Help governments make smarter, faster decisions.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100">
              {[
                { label: 'Wards Monitored', value: '7' },
                { label: 'Citizens Protected', value: '375K+' },
                { label: 'AI Accuracy', value: '94.2%' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side — Illustration */}
        <motion.div
          className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 border-l border-slate-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <SmartCityIllustration />
        </motion.div>
      </main>

      {/* City Selection */}
      <section className="px-8 lg:px-16 py-8 bg-slate-50 border-t border-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="heading-h2 border-none pl-0 mb-1">1. Select City</h2>
            <p className="text-sm text-slate-400">Choose the city you want to monitor</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {CITIES.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCitySelect(city.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                selectedCity === city.id
                  ? 'bg-orange-50 border-orange-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`p-1.5 rounded-full ${selectedCity === city.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-bold ${selectedCity === city.id ? 'text-orange-700' : 'text-slate-700'}`}>{city.name}</p>
                <p className="text-[10px] text-slate-400">{city.state}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Portal Cards */}
      <section className="px-8 lg:px-16 py-10 bg-white border-t border-slate-100">
        <div className="mb-6">
          <h2 className="heading-h2 border-none pl-0 mb-1">2. Select your access portal</h2>
          <p className="text-sm text-slate-400 mt-1">Choose your role to access the appropriate command center</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PORTALS.map((portal, i) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }}
              onClick={() => handlePortalSelect(portal)}
              className={`bg-white border border-slate-100 ${portal.border} rounded-2xl p-6 cursor-pointer group transition-all duration-300 flex flex-col`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${portal.iconBg} p-3 rounded-xl`}>
                  {portal.icon}
                </div>
                <motion.div
                  className="text-slate-300 group-hover:text-slate-700 transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{portal.subtitle}</p>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{portal.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{portal.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {portal.tags.map((tag) => (
                  <span key={tag} className={`text-xs font-medium px-2.5 py-1 rounded-full ${portal.tagBg}`}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Gradient bottom accent */}
              <div className={`mt-4 h-0.5 rounded-full bg-gradient-to-r ${portal.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 lg:px-16 py-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">UrbanHeatX AI · Smart City Heat Intelligence Platform · v1.0</p>
        <p className="text-xs text-slate-400">Bengaluru Urban Heat Monitoring System · Live Data</p>
      </footer>
    </div>
  );
};

export default PortalSelection;
