export interface HistoricalDataPoint {
  date: string;
  temperature: number;
  heatRiskIndex: number;
  gridLoad: number;
}

export interface ForecastDataPoint {
  day: string;
  temperature: number;
  risk: 'Low' | 'Medium' | 'High' | 'Extreme';
  load: number;
}
