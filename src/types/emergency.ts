export interface Hospital {
  id: string;
  name: string;
  coordinates: [number, number];
  capacity: number;
  occupiedBeds: number;
  heatstrokeBedsTotal: number;
  heatstrokeBedsOccupied: number;
  ambulanceDispatched: number;
  ambulanceTotal: number;
  status: 'Optimal' | 'Stable' | 'Critical' | 'Emergency';
  waterTankerStatus: 'Refilled' | 'Required' | 'Dispatched' | 'Optimal';
}

export interface CoolingCenter {
  id: string;
  name: string;
  coordinates: [number, number];
  capacity: number;
  currentOccupancy: number;
  waterAvailableLiters: number;
  acStatus: string;
  isEmergencyBackup: boolean;
}

export interface WaterStation {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  status: 'Operational' | 'Maintenance' | 'Out of Service';
  flowRate: 'High' | 'Optimal' | 'Low' | 'Zero';
  dailyUsageLiters: number;
}
