/// <reference types="vite/client" />
import axios from 'axios';
import wardsData from '../data/wards.json';
import heatSummaryData from '../data/heatData.json';
import hospitalsData from '../data/hospitals.json';
import waterStationsData from '../data/waterStations.json';
import citizenReportsData from '../data/citizenReports.json';
import { getCityById } from '../data/cityRegistry';
import { generateMockWards, generateMockHospitals, generateMockWaterStations } from '../data/mockDataGenerator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to simulate local mock responses when the FastAPI server is not active
const USE_MOCK_FALLBACK = true;

// Mock database in-memory so citizen uploads or status updates persist during user session!
let sessionWards = [...wardsData];
let sessionHeatData = { ...heatSummaryData };
let sessionHospitals = [...hospitalsData];
let sessionWaterStations = { ...waterStationsData };
let sessionCitizenReports = [...citizenReportsData];

export const changeApiCity = (cityId: string) => {
  if (cityId === 'bengaluru') {
    sessionWards = [...wardsData];
    sessionHeatData = { ...heatSummaryData };
    sessionHospitals = [...hospitalsData];
    sessionWaterStations = { ...waterStationsData };
    sessionCitizenReports = [...citizenReportsData];
  } else {
    const city = getCityById(cityId);
    if (!city) return;
    sessionWards = generateMockWards(city);
    sessionHospitals = generateMockHospitals(city);
    const waterMock = generateMockWaterStations(city);
    sessionWaterStations = {
      coolingCenters: waterMock.coolingCenters,
      waterStations: waterMock.waterStations,
    };
    sessionHeatData = { ...heatSummaryData }; 
    sessionCitizenReports = []; // Empty reports for new cities
  }
};

const originalGet = client.get;
const originalPost = client.post;

// Override GET to guarantee mock data serves properly for our frontend simulation
// @ts-ignore
client.get = async (url: string, config?: any) => {
  if (USE_MOCK_FALLBACK) {
    if (url.includes('/wards')) return Promise.resolve({ data: { success: true, data: sessionWards } });
    if (url.includes('/heat-summary')) return Promise.resolve({ data: { success: true, data: sessionHeatData } });
    if (url.includes('/hospitals')) return Promise.resolve({ data: { success: true, data: sessionHospitals } });
    if (url.includes('/water-stations')) return Promise.resolve({ data: { success: true, data: sessionWaterStations } });
    if (url.includes('/citizen-reports')) return Promise.resolve({ data: { success: true, data: sessionCitizenReports } });
  }
  return originalGet.call(client, url, config);
};

// Override POST
// @ts-ignore
client.post = async (url: string, data?: any, config?: any) => {
  if (USE_MOCK_FALLBACK) {
    if (url.includes('/citizen-reports')) {
      const body = data || {};
      const newReport = {
        id: `rep-${Date.now()}`,
        userName: body.userName || 'Anonymous Citizen',
        category: body.category || 'General Heat Issue',
        description: body.description || '',
        severity: body.severity || 'Medium',
        coordinates: body.coordinates || [12.9716, 77.5946],
        wardId: body.wardId || 'ward-1',
        timestamp: new Date().toISOString(),
        status: 'Pending' as const,
        imageUrl: body.imageUrl || undefined
      };
      sessionCitizenReports.unshift(newReport);
      return Promise.resolve({ data: { success: true, data: newReport } });
    }
    
    if (url.includes('/simulate-ward')) {
      const body = data || {};
      const { wardId, treeCoverage, budgetAllocated } = body;
      sessionWards = sessionWards.map(w => {
        if (w.id === wardId) {
          const tempDiff = (treeCoverage - w.treeCoverage) * 0.12;
          const newTemp = Math.max(34.0, w.temperature - tempDiff);
          const gridDiff = (treeCoverage - w.treeCoverage) * 0.6;
          const newGridLoad = Math.max(30, Math.round(w.gridLoad - gridDiff));
          return {
            ...w,
            treeCoverage,
            budgetAllocated,
            temperature: parseFloat(newTemp.toFixed(1)),
            gridLoad: newGridLoad,
            riskLevel: newTemp > 42 ? 'Extreme' : newTemp > 39 ? 'High' : newTemp > 36 ? 'Medium' : 'Low'
          };
        }
        return w;
      });
      return Promise.resolve({ data: { success: true, data: sessionWards } });
    }
  }
  return originalPost.call(client, url, data, config);
};

export default client;
export {
  sessionWards,
  sessionHeatData,
  sessionHospitals,
  sessionWaterStations,
  sessionCitizenReports
};
