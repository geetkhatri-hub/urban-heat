import client from '../api/client';
import { API_ENDPOINTS } from '../config/endpoints';
import { BudgetItem } from '../types/budget';
import { ApiResponse } from '../types/api';

export const budgetService = {
  getBudgetAllocation: async (): Promise<ApiResponse<BudgetItem[]>> => {
    const response = await client.get(API_ENDPOINTS.GET_HEAT_SUMMARY);
    return {
      success: response.data.success,
      data: response.data.data.budgetAllocation || [],
      message: response.data.message,
    };
  },
};
