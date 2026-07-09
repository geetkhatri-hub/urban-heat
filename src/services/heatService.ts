import client from '../api/client';
import { API_ENDPOINTS } from '../config/endpoints';
import { Ward, CitySummary } from '../types/heat';
import { ApiResponse } from '../types/api';

export const heatService = {
  getWards: async (): Promise<ApiResponse<Ward[]>> => {
    const response = await client.get(API_ENDPOINTS.GET_WARDS);
    return response.data;
  },

  getHeatSummary: async (): Promise<ApiResponse<CitySummary>> => {
    const response = await client.get(API_ENDPOINTS.GET_HEAT_SUMMARY);
    return response.data;
  },

  simulateWard: async (
    wardId: string,
    treeCoverage: number,
    budgetAllocated: number
  ): Promise<ApiResponse<Ward[]>> => {
    const response = await client.post(API_ENDPOINTS.SIMULATE_WARD, {
      wardId,
      treeCoverage,
      budgetAllocated,
    });
    return response.data;
  },
};
