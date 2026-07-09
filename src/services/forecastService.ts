import client from '../api/client';
import { API_ENDPOINTS } from '../config/endpoints';
import { HistoricalDataPoint, ForecastDataPoint } from '../types/forecast';
import { ApiResponse } from '../types/api';

export const forecastService = {
  getHistoricalData: async (): Promise<ApiResponse<HistoricalDataPoint[]>> => {
    // Reuses the heat-summary payload which contains historical records
    const response = await client.get(API_ENDPOINTS.GET_HEAT_SUMMARY);
    return {
      success: response.data.success,
      data: response.data.data.historical || [],
      message: response.data.message,
    };
  },

  getForecastData: async (): Promise<ApiResponse<ForecastDataPoint[]>> => {
    const response = await client.get(API_ENDPOINTS.GET_HEAT_SUMMARY);
    return {
      success: response.data.success,
      data: response.data.data.forecast || [],
      message: response.data.message,
    };
  },
};
