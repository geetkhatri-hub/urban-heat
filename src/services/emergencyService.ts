import client from '../api/client';
import { API_ENDPOINTS } from '../config/endpoints';
import { Hospital, CoolingCenter, WaterStation } from '../types/emergency';
import { ApiResponse } from '../types/api';

export const emergencyService = {
  getHospitals: async (): Promise<ApiResponse<Hospital[]>> => {
    const response = await client.get(API_ENDPOINTS.GET_HOSPITALS);
    return response.data;
  },

  getWaterStations: async (): Promise<ApiResponse<{ coolingCenters: CoolingCenter[]; waterStations: WaterStation[] }>> => {
    const response = await client.get(API_ENDPOINTS.GET_WATER_STATIONS);
    return response.data;
  },
};
