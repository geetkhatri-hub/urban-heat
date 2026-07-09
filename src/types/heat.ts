export interface WardRecommendations {
  priority: string;
  reason: string;
  coolingExpected: number;
  roi: string;
  cost: number;
  policy: string;
}

export interface Ward {
  id: string;
  name: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme' | 'Critical';
  temperature: number;
  treeCoverage: number;
  population: number;
  gridLoad: number;
  budgetAllocated: number;
  budgetRequired: number;
  coordinates: [number, number][];
  center: [number, number];
  recommendations: WardRecommendations;
}

export interface CitySummary {
  cityHealthScore: number;
  maxTemperature: number;
  averageTemperature: number;
  populationAtRisk: number;
  totalBudget: number;
  budgetSpent: number;
  treeCoveragePercent: number;
  averageGridLoad: number;
  heatwaveLevel: string;
}
