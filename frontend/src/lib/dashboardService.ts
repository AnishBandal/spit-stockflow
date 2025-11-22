import { api } from './api';

export interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  totalOperations: number;
  totalStockValue: string;
  operationsByType: Array<{ type: string; status: string; count: string }>;
  recentOperations: any[];
}

export interface MoveHistory {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  operation_id?: string;
  operation_reference?: string;
  from_location: string;
  to_location: string;
  quantity: number;
  user_id?: string;
  user_name?: string;
  notes?: string;
  created_at: string;
}

interface DashboardStatsResponse {
  success: boolean;
  stats: DashboardStats;
}

interface MoveHistoryResponse {
  success: boolean;
  history: MoveHistory[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats | null> => {
    try {
      const response = await api.get<DashboardStatsResponse>('/dashboard/stats');
      return response.stats;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return null;
    }
  },

  getMoveHistory: async (params?: { product_id?: string; limit?: number }): Promise<MoveHistory[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.product_id) queryParams.append('product_id', params.product_id);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get<MoveHistoryResponse>(`/dashboard/move-history${query}`);
      return response.history;
    } catch (error) {
      console.error('Failed to fetch move history:', error);
      return [];
    }
  },
};
