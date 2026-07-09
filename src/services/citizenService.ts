import client from '../api/client';
import { API_ENDPOINTS } from '../config/endpoints';
import { CitizenReport } from '../types/citizen';
import { ApiResponse } from '../types/api';

export const citizenService = {
  getReports: async (): Promise<ApiResponse<CitizenReport[]>> => {
    const response = await client.get(API_ENDPOINTS.GET_CITIZEN_REPORTS);
    return response.data;
  },

  submitReport: async (report: Partial<CitizenReport>): Promise<ApiResponse<CitizenReport>> => {
    const response = await client.post(API_ENDPOINTS.POST_CITIZEN_REPORT, report);
    return response.data;
  },
};
