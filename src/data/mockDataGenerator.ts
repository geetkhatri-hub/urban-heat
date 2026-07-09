import { CityMetadata } from './cityRegistry';
import { Ward } from '../types/heat';
import { Hospital, WaterStation, CoolingCenter } from '../types/emergency';

// Helper to generate a random number within a range
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Helper to generate coordinates around a center point
const generateCoordinatesAround = (center: [number, number], radiusKm: number, count: number): [number, number][] => {
  const points: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    // 1 degree is approx 111km
    const radiusInDeg = radiusKm / 111;
    const u = Math.random();
    const v = Math.random();
    const w = radiusInDeg * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    // adjust longitude based on latitude
    const y = w * Math.sin(t) / Math.cos(center[0] * Math.PI / 180);
    points.push([center[0] + x, center[1] + y]);
  }
  return points;
};

export const generateMockWards = (city: CityMetadata, count: number = 6): Ward[] => {
  const wards: Ward[] = [];
  const centers = generateCoordinatesAround(city.coordinates, 10, count);
  
  for (let i = 0; i < count; i++) {
    const center = centers[i];
    const riskLevels = ['Low', 'Medium', 'High', 'Extreme'] as const;
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const temp = randomInRange(36, 46);
    
    // Create a rough square for ward boundaries
    const offset = 0.015;
    const coordinates: [number, number][] = [
      [center[0] + offset, center[1] - offset],
      [center[0] + offset, center[1] + offset],
      [center[0] - offset, center[1] + offset],
      [center[0] - offset, center[1] - offset],
    ];

    wards.push({
      id: `${city.id}-ward-${i + 1}`,
      name: `${city.name} Zone ${i + 1}`,
      riskLevel,
      temperature: parseFloat(temp.toFixed(1)),
      treeCoverage: Math.floor(randomInRange(5, 45)),
      population: Math.floor(randomInRange(30000, 100000)),
      gridLoad: Math.floor(randomInRange(40, 98)),
      budgetAllocated: Math.floor(randomInRange(100, 500)) * 1000,
      budgetRequired: Math.floor(randomInRange(200, 800)) * 1000,
      coordinates,
      center,
      recommendations: {
        priority: riskLevel === 'Extreme' ? 'Critical' : riskLevel === 'High' ? 'High' : 'Medium',
        reason: 'Auto-generated mock reasoning for demonstration.',
        coolingExpected: parseFloat(randomInRange(0.5, 3).toFixed(1)),
        roi: `${parseFloat(randomInRange(5, 25).toFixed(1))}%`,
        cost: Math.floor(randomInRange(50, 200)) * 1000,
        policy: 'Deploy cool roofs and community shading.'
      }
    });
  }
  return wards;
};

export const generateMockHospitals = (city: CityMetadata, count: number = 5): Hospital[] => {
  const points = generateCoordinatesAround(city.coordinates, 8, count);
  return points.map((coord, i) => ({
    id: `${city.id}-hosp-${i + 1}`,
    name: `${city.name} General Hospital ${i + 1}`,
    coordinates: coord,
    capacity: Math.floor(randomInRange(100, 500)),
    occupiedBeds: Math.floor(randomInRange(80, 480)),
    heatstrokeBedsTotal: Math.floor(randomInRange(20, 50)),
    heatstrokeBedsOccupied: Math.floor(randomInRange(5, 45)),
    ambulanceDispatched: Math.floor(randomInRange(2, 10)),
    ambulanceTotal: Math.floor(randomInRange(5, 15)),
    status: ['Optimal', 'Stable', 'Critical', 'Emergency'][Math.floor(Math.random() * 4)] as any,
    waterTankerStatus: ['Refilled', 'Required', 'Dispatched', 'Optimal'][Math.floor(Math.random() * 4)] as any,
  }));
};

export const generateMockWaterStations = (city: CityMetadata, count: number = 8) => {
  const points = generateCoordinatesAround(city.coordinates, 6, count);
  
  const coolingCenters: CoolingCenter[] = points.slice(0, 3).map((coord, i) => ({
    id: `${city.id}-cc-${i + 1}`,
    name: `${city.name} Cooling Hub ${i + 1}`,
    coordinates: coord,
    capacity: Math.floor(randomInRange(50, 200)),
    currentOccupancy: Math.floor(randomInRange(10, 190)),
    waterAvailableLiters: Math.floor(randomInRange(200, 2000)),
    acStatus: 'Active',
    isEmergencyBackup: Math.random() > 0.5
  }));

  const waterStations: WaterStation[] = points.slice(3).map((coord, i) => ({
    id: `${city.id}-ws-${i + 1}`,
    name: `${city.name} Water Kiosk ${i + 1}`,
    type: ['Hydration Kiosk', 'Water Tanker Station', 'Smart Mist Fountain'][Math.floor(Math.random() * 3)],
    coordinates: coord,
    status: Math.random() > 0.8 ? 'Maintenance' : 'Operational',
    flowRate: ['High', 'Optimal', 'Low', 'Zero'][Math.floor(Math.random() * 3)] as any,
    dailyUsageLiters: Math.floor(randomInRange(300, 3000)),
  }));

  return { coolingCenters, waterStations };
};
