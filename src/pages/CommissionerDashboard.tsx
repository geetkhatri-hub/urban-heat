import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Flame, TreePine, Zap, Users, DollarSign, ThermometerSun,
  Map, Bell, LogOut, ChevronRight, Activity, ShieldAlert,
  TrendingUp, Lightbulb, FileText, Settings,
  AlertTriangle, CheckCircle, Download,
  RefreshCw, Cpu, Globe, Lock, Save,
  BrainCircuit
} from 'lucide-react';
import { heatService } from '../services/heatService';
import { forecastService } from '../services/forecastService';
import { budgetService } from '../services/budgetService';
import { useAppStore } from '../store/store';
import { MetricCard } from '../components/widgets/MetricCard';
import { ChartCard } from '../components/widgets/ChartCard';
import { CardSkeleton, ChartSkeleton } from '../components/widgets/LoadingSkeleton';
import { ErrorState } from '../components/widgets/ErrorState';
import { Ward } from '../types/heat';
import { getCityById, CITIES } from '../data/cityRegistry';
import { changeApiCity } from '../api/client';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type PanelId = 'Dashboard' | 'Heat Map' | 'Analytics' | 'AI Insights' | 'Budget' | 'Reports' | 'Settings';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const RISK_COLORS: Record<string, string> = {
  Low: '#16A34A',
  Medium: '#F97316',
  High: '#DC2626',
  Extreme: '#9F1239',
  Critical: '#4C0519',
};

const RISK_BG: Record<string, string> = {
  Low: 'bg-green-50 border-green-200',
  Medium: 'bg-orange-50 border-orange-200',
  High: 'bg-red-50 border-red-200',
  Extreme: 'bg-rose-100 border-rose-300',
  Critical: 'bg-red-950 border-red-800',
};

const NAV_LABELS: PanelId[] = ['Dashboard', 'Heat Map', 'Analytics', 'AI Insights', 'Budget', 'Reports', 'Settings'];

const NavIcon: React.FC<{ label: PanelId }> = ({ label }) => {
  switch (label) {
    case 'Dashboard':   return <Activity className="w-4 h-4" />;
    case 'Heat Map':    return <Map className="w-4 h-4" />;
    case 'Analytics':  return <TrendingUp className="w-4 h-4" />;
    case 'AI Insights':return <Lightbulb className="w-4 h-4" />;
    case 'Budget':     return <DollarSign className="w-4 h-4" />;
    case 'Reports':    return <FileText className="w-4 h-4" />;
    case 'Settings':   return <Settings className="w-4 h-4" />;
    default:           return <Activity className="w-4 h-4" />;
  }
};

/* ─── Small Reusable Components ──────────────────────────────────────────── */
const RiskBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors: Record<string, string> = {
    Low: 'bg-green-50 text-green-700 border-green-200',
    Medium: 'bg-orange-50 text-orange-700 border-orange-200',
    High: 'bg-red-50 text-red-700 border-red-200',
    Extreme: 'bg-rose-100 text-rose-800 border-rose-300',
    Critical: 'bg-red-950 text-red-200 border-red-800',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colors[level] ?? colors.Medium}`}>
      {level}
    </span>
  );
};

const StatBox: React.FC<{ label: string; value: string; sub?: string; accent?: string }> = ({
  label, value, sub, accent = 'text-slate-800',
}) => (
  <div className="bg-slate-50 rounded-xl p-4">
    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className={`text-xl font-bold ${accent}`}>{value}</p>
    {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   PANEL: HEAT MAP
════════════════════════════════════════════════════════════════════════════ */
const HeatMapPanel: React.FC<{ wards: Ward[]; loading: boolean }> = ({ wards, loading }) => {
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const levels = ['All', 'Critical', 'Extreme', 'High', 'Medium', 'Low'];
  const filtered = filterLevel === 'All' ? wards : wards.filter(w => w.riskLevel === filterLevel);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-h1 mb-0">Heat Map</h1>
          <p className="text-xs text-slate-400 mt-0.5">Bengaluru ward-level thermal intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter by Risk:</span>
          {levels.map(l => (
            <button
              key={l}
              onClick={() => setFilterLevel(l)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterLevel === l
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-5 gap-3">
        {['Critical', 'Extreme', 'High', 'Medium', 'Low'].map(lvl => {
          const count = wards.filter(w => w.riskLevel === lvl).length;
          return (
            <div key={lvl} className={`rounded-xl p-3 border ${RISK_BG[lvl] ?? 'bg-slate-50 border-slate-200'}`}>
              <p className="text-lg font-black" style={{ color: RISK_COLORS[lvl] }}>{count}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{lvl}</p>
            </div>
          );
        })}
      </div>

      {/* Ward grid cards */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(null).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ward, i) => (
            <motion.div
              key={ward.id}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[ward.riskLevel] }}
                  />
                  <p className="text-sm font-semibold text-slate-800">{ward.name}</p>
                </div>
                <RiskBadge level={ward.riskLevel} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-[10px] text-slate-400">Temp</p>
                  <p className="text-base font-bold text-red-500">{ward.temperature}°C</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Tree Cover</p>
                  <p className="text-base font-bold text-green-600">{ward.treeCoverage}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Grid Load</p>
                  <p className="text-base font-bold text-yellow-600">{ward.gridLoad}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Population</p>
                  <p className="text-base font-bold text-slate-700">{ward.population.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                  {ward.recommendations.policy}
                </p>
              </div>
              {/* Temperature bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Thermal Index</span>
                  <span>{Math.round(((ward.temperature - 28) / 14) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round(((ward.temperature - 28) / 14) * 100))}%`,
                      backgroundColor: RISK_COLORS[ward.riskLevel],
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   PANEL: ANALYTICS
════════════════════════════════════════════════════════════════════════════ */
const AnalyticsPanel: React.FC<{
  wards: Ward[];
  historical: any[];
  forecast: any[];
}> = ({ wards, historical, forecast }) => {
  const tempByWard = wards.slice(0, 8).map(w => ({ name: w.name.split(' ')[0], temp: w.temperature, tree: w.treeCoverage, grid: w.gridLoad }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-h1 mb-0">Analytics</h1>
        <p className="text-xs text-slate-400 mt-0.5">Deep-dive into city thermal patterns and trends</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Avg City Temp" value={`${(wards.reduce((s, w) => s + w.temperature, 0) / (wards.length || 1)).toFixed(1)}°C`} sub="All wards combined" accent="text-red-600" />
        <StatBox label="Avg Tree Coverage" value={`${(wards.reduce((s, w) => s + w.treeCoverage, 0) / (wards.length || 1)).toFixed(1)}%`} sub="City-wide average" accent="text-green-600" />
        <StatBox label="Avg Grid Load" value={`${(wards.reduce((s, w) => s + w.gridLoad, 0) / (wards.length || 1)).toFixed(1)}%`} sub="All wards combined" accent="text-yellow-600" />
        <StatBox label="Total At-Risk Population" value={`${Math.round(wards.filter(w => w.riskLevel !== 'Low').reduce((s, w) => s + w.population, 0) / 1000)}K`} sub="Non-low-risk wards" accent="text-orange-600" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Temperature by Ward" subtitle="Current readings (top 8)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tempByWard} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[28, 42]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="temp" name="Temp (°C)" radius={[6, 6, 0, 0]}>
                {tempByWard.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.temp >= 36 ? '#DC2626' : entry.temp >= 33 ? '#F97316' : '#16A34A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Historical Temperature Trend" subtitle="5-week city average">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={historical}>
              <defs>
                <linearGradient id="anaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[34, 46]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="temperature" stroke="#F97316" strokeWidth={2.5} fill="url(#anaGrad)" dot={{ fill: '#F97316', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="7-Day Forecast" subtitle="Temperature & Grid Load">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={forecast} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="temp" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[30, 50]} />
              <YAxis yAxisId="load" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[40, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="temp" dataKey="temperature" name="Temp (°C)" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="load" dataKey="load" name="Grid Load (%)" fill="#FDBA74" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Heat Risk Index Trend" subtitle="Weekly progression">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historical}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Line type="monotone" dataKey="heatRiskIndex" stroke="#DC2626" strokeWidth={2.5} dot={{ fill: '#DC2626', r: 3 }} name="Risk Index" />
              <Line type="monotone" dataKey="gridLoad" stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316', r: 3 }} name="Grid Load" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Full ward table */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <h2 className="heading-h2 mb-4">Complete Ward Analytics</h2>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                {['Ward', 'Temp', 'Tree Cover', 'Grid Load', 'Population', 'Budget Allocated', 'Budget Required', 'Risk'].map(h => (
                  <th key={h} className={`py-2 text-slate-400 font-medium ${h === 'Ward' ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wards.map(w => (
                <tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 font-medium text-slate-700">{w.name}</td>
                  <td className="py-2.5 text-right font-semibold" style={{ color: RISK_COLORS[w.riskLevel] }}>{w.temperature}°C</td>
                  <td className="py-2.5 text-right text-green-600 font-medium">{w.treeCoverage}%</td>
                  <td className="py-2.5 text-right text-slate-500">{w.gridLoad}%</td>
                  <td className="py-2.5 text-right text-slate-600">{w.population.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-slate-600">₹{(w.budgetAllocated / 100000).toFixed(1)}L</td>
                  <td className="py-2.5 text-right text-orange-600">₹{(w.budgetRequired / 100000).toFixed(1)}L</td>
                  <td className="py-2.5 text-right"><RiskBadge level={w.riskLevel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   PANEL: AI INSIGHTS
════════════════════════════════════════════════════════════════════════════ */
const AIInsightsPanel: React.FC<{ wards: Ward[] }> = ({ wards }) => {
  const critical = wards.filter(w => w.riskLevel === 'Critical' || w.riskLevel === 'Extreme');
  const high = wards.filter(w => w.riskLevel === 'High');
  const totalSavings = wards.reduce((s, w) => s + w.recommendations.cost, 0);

  const insights = [
    {
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      title: 'Immediate Action Required',
      desc: `${critical.length} wards are in Critical/Extreme risk. Deploy emergency cooling measures within 24 hours.`,
      bg: 'bg-red-50 border-red-100',
      badge: 'CRITICAL',
      badgeColor: 'bg-red-500',
    },
    {
      icon: <TreePine className="w-5 h-5 text-green-600" />,
      title: 'Urban Greening Opportunity',
      desc: `Increasing tree coverage by 15% in high-risk wards could reduce average temperature by 2.3°C city-wide.`,
      bg: 'bg-green-50 border-green-100',
      badge: 'HIGH IMPACT',
      badgeColor: 'bg-green-600',
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      title: 'Grid Overload Risk',
      desc: `${wards.filter(w => w.gridLoad > 75).length} wards have grid load above 75%. Demand response needed to prevent blackouts.`,
      bg: 'bg-yellow-50 border-yellow-100',
      badge: 'WARNING',
      badgeColor: 'bg-yellow-500',
    },
    {
      icon: <BrainCircuit className="w-5 h-5 text-purple-600" />,
      title: 'Predictive Heat Wave',
      desc: `AI models predict a 78% probability of extreme heat wave in the next 5 days. Pre-emptive cooling centers needed.`,
      bg: 'bg-purple-50 border-purple-100',
      badge: 'FORECAST',
      badgeColor: 'bg-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-h1 mb-0">AI Insights</h1>
        <p className="text-xs text-slate-400 mt-0.5">Machine-learning powered urban heat intelligence</p>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            className={`border rounded-2xl p-5 ${ins.bg}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{ins.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] text-white font-bold px-2 py-0.5 rounded-full ${ins.badgeColor}`}>{ins.badge}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1">{ins.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{ins.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Per-ward AI recommendations */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="heading-h2 mb-4">Ward-Level AI Recommendations</h2>
        <div className="space-y-4">
          {wards.map((ward, i) => (
            <motion.div
              key={ward.id}
              className="border border-slate-100 rounded-xl p-4 hover:border-orange-200 transition-colors"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[ward.riskLevel] }} />
                  <span className="text-sm font-semibold text-slate-800">{ward.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Priority:</span>
                  <span className="text-xs font-bold text-orange-600">{ward.recommendations.priority}</span>
                  <RiskBadge level={ward.riskLevel} />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{ward.recommendations.reason}</p>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-2.5 mb-3">
                <p className="text-[11px] text-orange-700 leading-relaxed">{ward.recommendations.policy}</p>
              </div>
              <div className="flex items-center gap-6 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ThermometerSun className="w-3 h-3 text-blue-400" />
                  Cooling: <strong className="text-blue-600 ml-1">-{ward.recommendations.coolingExpected}°C</strong>
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  ROI: <strong className="text-green-600 ml-1">{ward.recommendations.roi}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-orange-400" />
                  Budget: <strong className="text-orange-600 ml-1">₹{(ward.recommendations.cost / 100000).toFixed(1)}L</strong>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="w-5 h-5 text-orange-200" />
          <span className="text-sm font-semibold text-orange-100 uppercase tracking-widest">AI Summary</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-orange-200 text-xs mb-1">Wards Requiring Immediate Action</p>
            <p className="text-3xl font-black">{critical.length + high.length}</p>
          </div>
          <div>
            <p className="text-orange-200 text-xs mb-1">Total Investment Required</p>
            <p className="text-3xl font-black">₹{(totalSavings / 10000000).toFixed(1)}Cr</p>
          </div>
          <div>
            <p className="text-orange-200 text-xs mb-1">Projected Temp Reduction</p>
            <p className="text-3xl font-black">-3.2°C</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   PANEL: BUDGET
════════════════════════════════════════════════════════════════════════════ */
const BudgetPanel: React.FC<{ wards: Ward[]; budgetData: any[] }> = ({ wards, budgetData }) => {
  const totalRequired = wards.reduce((s, w) => s + w.budgetRequired, 0);
  const totalSpent = 13900000; // ₹139L
  const totalBudget = 18000000; // ₹180L
  const pct = Math.round((totalSpent / totalBudget) * 100);

  const byRisk = ['Critical', 'Extreme', 'High', 'Medium', 'Low'].map(lvl => ({
    level: lvl,
    wards: wards.filter(w => w.riskLevel === lvl),
    allocated: wards.filter(w => w.riskLevel === lvl).reduce((s, w) => s + w.budgetAllocated, 0),
    required: wards.filter(w => w.riskLevel === lvl).reduce((s, w) => s + w.budgetRequired, 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-h1 mb-0">Budget</h1>
        <p className="text-xs text-slate-400 mt-0.5">Fiscal year heat mitigation budget tracking</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Total Budget" value="₹180L" sub="FY 2025-26" accent="text-slate-800" />
        <StatBox label="Budget Spent" value="₹139L" sub={`${pct}% utilized`} accent="text-orange-600" />
        <StatBox label="Remaining" value="₹41L" sub="Available balance" accent="text-green-600" />
        <StatBox label="Total Required" value={`₹${(totalRequired / 100000).toFixed(0)}L`} sub="All wards combined" accent="text-red-600" />
      </div>

      {/* Budget utilization bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="heading-h2">Budget Utilization</h2>
          <span className="text-sm font-bold text-orange-600">{pct}%</span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>₹0</span>
          <span>₹139L spent</span>
          <span>₹180L</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {budgetData.length > 0 && (
          <ChartCard title="Budget Allocation by Category" subtitle="Current fiscal year">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={budgetData} innerRadius={55} outerRadius={82} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={800}>
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`₹${(value / 100000).toFixed(1)}L`, '']} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
              {budgetData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-slate-500 truncate">{item.name}</span>
                  <span className="text-[10px] text-slate-700 font-semibold ml-auto">₹{(item.value / 100000).toFixed(1)}L</span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        <ChartCard title="Allocated vs Required by Risk Level" subtitle="Ward-level comparison">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byRisk.filter(b => b.wards.length > 0)} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="level" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: number) => [`₹${(v / 100000).toFixed(1)}L`]} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="allocated" name="Allocated" fill="#FDBA74" radius={[4, 4, 0, 0]} />
              <Bar dataKey="required" name="Required" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Per-ward budget table */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <h2 className="heading-h2 mb-4">Ward Budget Breakdown</h2>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                {['Ward', 'Risk Level', 'Allocated', 'Required', 'Gap', 'Coverage'].map(h => (
                  <th key={h} className={`py-2 text-slate-400 font-medium ${h === 'Ward' ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wards.map(w => {
                const gap = w.budgetRequired - w.budgetAllocated;
                const coverage = Math.min(100, Math.round((w.budgetAllocated / w.budgetRequired) * 100));
                return (
                  <tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-medium text-slate-700">{w.name}</td>
                    <td className="py-2.5 text-right"><RiskBadge level={w.riskLevel} /></td>
                    <td className="py-2.5 text-right text-slate-600">₹{(w.budgetAllocated / 100000).toFixed(1)}L</td>
                    <td className="py-2.5 text-right text-slate-600">₹{(w.budgetRequired / 100000).toFixed(1)}L</td>
                    <td className={`py-2.5 text-right font-semibold ${gap > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {gap > 0 ? `+₹${(gap / 100000).toFixed(1)}L` : `₹${(Math.abs(gap) / 100000).toFixed(1)}L surplus`}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${coverage}%`, backgroundColor: coverage >= 80 ? '#16A34A' : coverage >= 50 ? '#F97316' : '#DC2626' }}
                          />
                        </div>
                        <span className="text-slate-500">{coverage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   PANEL: REPORTS
════════════════════════════════════════════════════════════════════════════ */
const ReportsPanel: React.FC<{ wards: Ward[]; summary: any }> = ({ wards, summary }) => {
  const reports = [
    { title: 'Weekly Heat Index Report', date: '07 Jul 2026', type: 'Weekly', status: 'Ready', icon: <ThermometerSun className="w-4 h-4 text-red-500" /> },
    { title: 'Ward Risk Assessment Q2', date: '01 Jul 2026', type: 'Quarterly', status: 'Ready', icon: <ShieldAlert className="w-4 h-4 text-orange-500" /> },
    { title: 'Budget Utilization Report', date: '30 Jun 2026', type: 'Monthly', status: 'Ready', icon: <DollarSign className="w-4 h-4 text-purple-500" /> },
    { title: 'AI Policy Impact Summary', date: '25 Jun 2026', type: 'Monthly', status: 'Ready', icon: <Lightbulb className="w-4 h-4 text-yellow-500" /> },
    { title: 'Tree Coverage Audit', date: '20 Jun 2026', type: 'Monthly', status: 'Ready', icon: <TreePine className="w-4 h-4 text-green-500" /> },
    { title: 'Grid Load Analysis', date: '15 Jun 2026', type: 'Weekly', status: 'Ready', icon: <Zap className="w-4 h-4 text-yellow-600" /> },
    { title: 'Emergency Response Drill Log', date: '10 Jun 2026', type: 'One-time', status: 'Ready', icon: <AlertTriangle className="w-4 h-4 text-red-600" /> },
    { title: 'Citizen Impact Assessment', date: '01 Jun 2026', type: 'Monthly', status: 'Ready', icon: <Users className="w-4 h-4 text-blue-500" /> },
  ];

  const stats = [
    { label: 'Reports Generated', value: '48', sub: 'This fiscal year' },
    { label: 'Wards Covered', value: `${wards.length}`, sub: 'All active' },
    { label: 'Data Points', value: '12,450', sub: 'Collected today' },
    { label: 'Last Updated', value: '12:05 PM', sub: 'Auto-refresh: 5min' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-h1 mb-0">Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">Generated reports and data exports</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Download className="w-3.5 h-3.5" />
          Export All
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <StatBox key={s.label} label={s.label} value={s.value} sub={s.sub} />
        ))}
      </div>

      {/* Report list */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <h2 className="heading-h2 mb-4">Available Reports</h2>
        <div className="space-y-2">
          {reports.map((r, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer group"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">{r.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{r.title}</p>
                  <p className="text-[10px] text-slate-400">{r.date} · {r.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <CheckCircle className="w-3 h-3" /> {r.status}
                </span>
                <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 font-medium transition-colors px-2 py-1">
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* City summary report */}
      {summary && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="heading-h2 mb-4">Live City Summary Report</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="City Health Score" value={`${summary.cityHealthScore}/100`} accent="text-blue-600" />
            <StatBox label="Max Temperature" value={`${summary.maxTemperature}°C`} accent="text-red-600" />
            <StatBox label="Average Temperature" value={`${summary.averageTemperature}°C`} accent="text-orange-600" />
            <StatBox label="Heatwave Level" value={summary.heatwaveLevel} accent="text-purple-600" />
            <StatBox label="Population at Risk" value={`${(summary.populationAtRisk / 1000).toFixed(0)}K`} accent="text-orange-700" />
            <StatBox label="Tree Coverage" value={`${summary.treeCoveragePercent}%`} accent="text-green-600" />
            <StatBox label="Avg Grid Load" value={`${summary.averageGridLoad}%`} accent="text-yellow-600" />
            <StatBox label="Budget Spent" value={`₹${(summary.budgetSpent / 100000).toFixed(0)}L`} accent="text-purple-600" />
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   PANEL: SETTINGS
════════════════════════════════════════════════════════════════════════════ */
const SettingsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(36);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-6 rounded-full transition-colors ${value ? 'bg-orange-500' : 'bg-slate-200'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );

  const sections = [
    {
      title: 'Notifications',
      icon: <Bell className="w-4 h-4 text-orange-500" />,
      items: [
        {
          label: 'Enable Alert Notifications',
          desc: 'Receive real-time alerts for critical heat events',
          control: <Toggle value={notifications} onChange={setNotifications} />,
        },
        {
          label: 'Alert Temperature Threshold',
          desc: `Trigger alerts when temperature exceeds ${alertThreshold}°C`,
          control: (
            <div className="flex items-center gap-2">
              <input
                type="range" min={30} max={45} value={alertThreshold}
                onChange={e => setAlertThreshold(Number(e.target.value))}
                className="w-24 accent-orange-500"
              />
              <span className="text-xs font-bold text-orange-600 w-8">{alertThreshold}°C</span>
            </div>
          ),
        },
      ],
    },
    {
      title: 'Data Refresh',
      icon: <RefreshCw className="w-4 h-4 text-blue-500" />,
      items: [
        {
          label: 'Auto Refresh',
          desc: 'Automatically update data at set intervals',
          control: <Toggle value={autoRefresh} onChange={setAutoRefresh} />,
        },
        {
          label: 'Refresh Interval',
          desc: `Data refreshes every ${refreshInterval} minutes`,
          control: (
            <div className="flex items-center gap-2">
              <input
                type="range" min={1} max={30} value={refreshInterval}
                onChange={e => setRefreshInterval(Number(e.target.value))}
                className="w-24 accent-blue-500"
              />
              <span className="text-xs font-bold text-blue-600 w-8">{refreshInterval}m</span>
            </div>
          ),
        },
      ],
    },
    {
      title: 'Account',
      icon: <Lock className="w-4 h-4 text-slate-500" />,
      items: [
        { label: 'Name', desc: 'Commissioner', control: <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">Commissioner</span> },
        { label: 'Organisation', desc: 'Bengaluru BBMP', control: <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">Bengaluru BBMP</span> },
        { label: 'Role', desc: 'Administrator', control: <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">Admin</span> },
      ],
    },
    {
      title: 'System',
      icon: <Cpu className="w-4 h-4 text-green-500" />,
      items: [
        { label: 'AI Engine', desc: 'UrbanHeatX v2.1 — Active', control: <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Online</span> },
        { label: 'Data Source', desc: 'Live ward sensors + satellite', control: <span className="flex items-center gap-1 text-xs text-blue-600 font-medium"><Globe className="w-3.5 h-3.5" /> Connected</span> },
        { label: 'Backend API', desc: 'FastAPI + PostgreSQL', control: <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Healthy</span> },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-h1 mb-0">Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure portal preferences and notifications</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm ${
            saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-5">
        {sections.map(section => (
          <div key={section.title} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              {section.icon}
              <h2 className="heading-h2">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.items.map((item, i) => (
                <div key={i} className={`flex items-center justify-between py-3 ${i < section.items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  {item.control}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   PANEL: DASHBOARD (original content)
════════════════════════════════════════════════════════════════════════════ */
const DashboardPanel: React.FC<{
  summary: any;
  wards: Ward[];
  historical: any[];
  forecast: any[];
  budgetData: any[];
  wardsLoading: boolean;
  summaryLoading: boolean;
  histLoading: boolean;
  wardsError: any;
  queryClient: any;
  selectedWard: Ward | null;
  setSelectedWard: (w: Ward | null) => void;
}> = ({
  summary, wards, historical, forecast, budgetData,
  wardsLoading, summaryLoading, histLoading, wardsError,
  queryClient, selectedWard, setSelectedWard,
}) => {
  const topDangerousWards = [...wards].sort((a, b) => b.temperature - a.temperature).slice(0, 5);
  const worstWard = topDangerousWards[0];

  return (
    <div className="space-y-6">
      {/* === SECTION 1: City Health KPIs === */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array(6).fill(null).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard label="City Health" value={summary.cityHealthScore} unit="/100"
            icon={<Activity className="w-5 h-5" />} iconBg="bg-blue-50" accentColor="text-blue-600"
            trend="down" trendValue="3pts" />
          <MetricCard label="Max Temp" value={summary.maxTemperature} unit="°C"
            icon={<ThermometerSun className="w-5 h-5" />} iconBg="bg-red-50" accentColor="text-red-600"
            trend="up" trendValue="+2.1°C" />
          <MetricCard label="Population at Risk" value="185K"
            icon={<Users className="w-5 h-5" />} iconBg="bg-orange-50" accentColor="text-orange-600"
            trend="up" trendValue="+12K" />
          <MetricCard label="Tree Coverage" value={`${summary.treeCoveragePercent}%`}
            icon={<TreePine className="w-5 h-5" />} iconBg="bg-green-50" accentColor="text-green-600"
            trend="down" trendValue="-0.8%" />
          <MetricCard label="Grid Load" value={`${summary.averageGridLoad}%`}
            icon={<Zap className="w-5 h-5" />} iconBg="bg-yellow-50" accentColor="text-yellow-600"
            trend="up" trendValue="+6%" />
          <MetricCard label="Budget Spent" value="₹139L" unit="/₹180L"
            icon={<DollarSign className="w-5 h-5" />} iconBg="bg-purple-50" accentColor="text-purple-600" />
        </div>
      ) : null}

      {/* === SECTION 2: AI Recommendation + Top Wards === */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {worstWard && (
          <motion.div
            className="xl:col-span-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-orange-200" />
                  <span className="text-xs font-semibold text-orange-100 uppercase tracking-widest">AI Priority Recommendation</span>
                </div>
                <h2 className="heading-h2 text-white border-white/50 pl-3">{worstWard.name}</h2>
                <p className="text-orange-200 text-sm mt-0.5">Priority: {worstWard.recommendations.priority}</p>
              </div>
              <span className="bg-white/20 border border-white/30 px-3 py-1 rounded-full text-xs font-semibold">
                {worstWard.temperature}°C
              </span>
            </div>
            <p className="text-orange-50 text-sm leading-relaxed mb-4">{worstWard.recommendations.reason}</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-orange-200 text-xs">Expected Cooling</p>
                <p className="text-white font-bold text-lg">-{worstWard.recommendations.coolingExpected}°C</p>
              </div>
              <div>
                <p className="text-orange-200 text-xs">Estimated ROI</p>
                <p className="text-white font-bold text-lg">{worstWard.recommendations.roi}</p>
              </div>
              <div>
                <p className="text-orange-200 text-xs">Budget Required</p>
                <p className="text-white font-bold text-lg">₹{(worstWard.recommendations.cost / 100000).toFixed(1)}L</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 mb-4">
              <p className="text-orange-100 text-xs leading-relaxed">{worstWard.recommendations.policy}</p>
            </div>
            <button className="flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
              Initiate Action Plan <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h2 className="heading-h2">Top Dangerous Wards</h2>
          {wardsLoading ? (
            <CardSkeleton />
          ) : wardsError ? (
            <ErrorState onRetry={() => queryClient.invalidateQueries({ queryKey: ['wards'] })} />
          ) : (
            <div className="space-y-3">
              {topDangerousWards.map((ward, i) => (
                <motion.div
                  key={ward.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedWard?.id === ward.id ? 'bg-orange-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedWard(ward === selectedWard ? null : ward)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="text-lg font-black text-slate-200 w-5 text-center leading-none">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{ward.name}</p>
                    <p className="text-[10px] text-slate-400">{ward.population.toLocaleString()} residents</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-red-500">{ward.temperature}°C</p>
                    <RiskBadge level={ward.riskLevel} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* === SECTION 3: Ward Detail Expanded === */}
      <AnimatePresence>
        {selectedWard && (
          <motion.div
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="heading-h2 mb-0">{selectedWard.name}</h2>
                <p className="text-sm text-slate-500">Ward Detail Analysis</p>
              </div>
              <RiskBadge level={selectedWard.riskLevel} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'Temperature', value: `${selectedWard.temperature}°C` },
                { label: 'Tree Coverage', value: `${selectedWard.treeCoverage}%` },
                { label: 'Population', value: selectedWard.population.toLocaleString() },
                { label: 'Grid Load', value: `${selectedWard.gridLoad}%` },
                { label: 'Budget Allocated', value: `₹${(selectedWard.budgetAllocated / 100000).toFixed(1)}L` },
                { label: 'Budget Required', value: `₹${(selectedWard.budgetRequired / 100000).toFixed(1)}L` },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-base font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <p className="text-xs font-semibold text-orange-700 mb-1">Policy Recommendation</p>
              <p className="text-sm text-orange-600">{selectedWard.recommendations.policy}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === SECTION 4: Charts Row === */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {histLoading ? <ChartSkeleton /> : (
          <ChartCard title="Temperature Trend" subtitle="5-week historical record">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={historical}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[34, 46]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Area type="monotone" dataKey="temperature" stroke="#DC2626" strokeWidth={2.5} fill="url(#tempGrad)" dot={{ fill: '#DC2626', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {histLoading ? <ChartSkeleton /> : (
          <ChartCard title="Heat Risk Index" subtitle="5-week trend">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={historical}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Line type="monotone" dataKey="heatRiskIndex" stroke="#F97316" strokeWidth={2.5} dot={{ fill: '#F97316', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <ChartCard title="Budget Allocation" subtitle="Current fiscal year">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={budgetData} innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={800}>
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`₹${(value / 100000).toFixed(1)}L`, '']} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {budgetData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-slate-500 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* === SECTION 5: 7-Day Forecast + Ward Grid === */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="7-Day Forecast" subtitle="Temperature & Grid Load projection">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={forecast} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="temp" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[30, 50]} />
              <YAxis yAxisId="load" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[40, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="temp" dataKey="temperature" name="Temp (°C)" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="load" dataKey="load" name="Grid Load (%)" fill="#FDBA74" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h2 className="heading-h2">All Wards Overview</h2>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-400 font-medium">Ward</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Temp</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Trees</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Grid</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                {wards.map((w) => (
                  <tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedWard(w === selectedWard ? null : w)}>
                    <td className="py-2.5 font-medium text-slate-700">{w.name}</td>
                    <td className="py-2.5 text-right font-semibold" style={{ color: RISK_COLORS[w.riskLevel] }}>{w.temperature}°C</td>
                    <td className="py-2.5 text-right text-green-600 font-medium">{w.treeCoverage}%</td>
                    <td className="py-2.5 text-right text-slate-500">{w.gridLoad}%</td>
                    <td className="py-2.5 text-right"><RiskBadge level={w.riskLevel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* === SECTION 6: Policy Recommendations === */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="heading-h2 mb-0">AI Policy Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {wards.filter(w => w.riskLevel === 'High' || w.riskLevel === 'Extreme' || w.riskLevel === 'Critical').map((ward) => (
            <div key={ward.id} className="border border-slate-100 rounded-xl p-4 hover:border-orange-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">{ward.name}</span>
                <RiskBadge level={ward.riskLevel} />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{ward.recommendations.policy}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>ROI: <strong className="text-green-600">{ward.recommendations.roi}</strong></span>
                <span>Budget: <strong className="text-orange-600">₹{(ward.recommendations.cost / 100000).toFixed(1)}L</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
const CommissionerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const setRole = useAppStore((s) => s.setRole);
  const selectedCity = useAppStore((s) => s.selectedCity);
  const setCity = useAppStore((s) => s.setCity);
  const [activePanel, setActivePanel] = useState<PanelId>('Dashboard');
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const queryClient = useQueryClient();

  const city = getCityById(selectedCity) || CITIES[0];

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    changeApiCity(newCity);
    queryClient.invalidateQueries(); // Refresh all API data
  };

  const { data: wardsResp, isLoading: wardsLoading, error: wardsError } = useQuery({
    queryKey: ['wards'],
    queryFn: heatService.getWards,
  });

  const { data: summaryResp, isLoading: summaryLoading } = useQuery({
    queryKey: ['heatSummary'],
    queryFn: heatService.getHeatSummary,
  });

  const { data: historicalResp, isLoading: histLoading } = useQuery({
    queryKey: ['historical'],
    queryFn: forecastService.getHistoricalData,
  });

  const { data: forecastResp } = useQuery({
    queryKey: ['forecast'],
    queryFn: forecastService.getForecastData,
  });

  const { data: budgetResp } = useQuery({
    queryKey: ['budget'],
    queryFn: budgetService.getBudgetAllocation,
  });

  const wards = wardsResp?.data ?? [];
  const summary = summaryResp?.data;
  const historical = historicalResp?.data ?? [];
  const forecast = forecastResp?.data ?? [];
  const budgetData = budgetResp?.data ?? [];

  const handleLogout = () => {
    setRole(null);
    navigate('/');
  };

  /* ── Panel renderer ── */
  const renderPanel = () => {
    switch (activePanel) {
      case 'Dashboard':
        return (
          <DashboardPanel
            summary={summary}
            wards={wards}
            historical={historical}
            forecast={forecast}
            budgetData={budgetData}
            wardsLoading={wardsLoading}
            summaryLoading={summaryLoading}
            histLoading={histLoading}
            wardsError={wardsError}
            queryClient={queryClient}
            selectedWard={selectedWard}
            setSelectedWard={setSelectedWard}
          />
        );
      case 'Heat Map':
        return <HeatMapPanel wards={wards} loading={wardsLoading} />;
      case 'Analytics':
        return <AnalyticsPanel wards={wards} historical={historical} forecast={forecast} />;
      case 'AI Insights':
        return <AIInsightsPanel wards={wards} />;
      case 'Budget':
        return <BudgetPanel wards={wards} budgetData={budgetData} />;
      case 'Reports':
        return <ReportsPanel wards={wards} summary={summary} />;
      case 'Settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col shadow-sm shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">UrbanHeatX <span className="text-orange-500">AI</span></span>
              <p className="text-[10px] text-slate-400">Commissioner Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => { setActivePanel(label); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activePanel === label
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <NavIcon label={label} />
              {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              MC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">Commissioner</p>
              <p className="text-[10px] text-slate-400 truncate">{city.name} Municipal Corp</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-red-500 transition-colors py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Portal
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="heading-h1 mb-0">{city.name} Heat Command Center</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {city.name} Urban Heat Intelligence · Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedCity}
              onChange={handleCitySelect}
              className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              {CITIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {summary && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-red-600">{summary.heatwaveLevel}</span>
              </div>
            )}
            <button className="relative p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
          <div key={activePanel}>
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommissionerDashboard;
