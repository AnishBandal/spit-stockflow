import { api } from './api';

export interface StockLocation {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_code: string;
  location_id: string;
  location_name: string;
  location_code: string;
  on_hand: number;
  free_to_use: number;
  cost_per_unit: number;
  unit_of_measure: string;
}

interface StockResponse {
  success: boolean;
  stock: StockLocation[];
}

interface StockItemResponse {
  success: boolean;
  stock: StockLocation;
  message?: string;
}

export const stockService = {
  getAll: async (params?: { warehouse_id?: string; product_id?: string }): Promise<StockLocation[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
      if (params?.product_id) queryParams.append('product_id', params.product_id);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get<StockResponse>(`/stock${query}`);
      return response.stock;
    } catch (error) {
      console.error('Failed to fetch stock:', error);
      return [];
    }
  },

  getOne: async (id: string): Promise<StockLocation | null> => {
    try {
      const response = await api.get<StockItemResponse>(`/stock/${id}`);
      return response.stock;
    } catch (error) {
      console.error('Failed to fetch stock item:', error);
      return null;
    }
  },

  updateQuantity: async (id: string, data: { on_hand: number; free_to_use: number }): Promise<StockLocation | null> => {
    try {
      const response = await api.put<StockItemResponse>(`/stock/${id}`, data);
      return response.stock;
    } catch (error) {
      console.error('Failed to update stock:', error);
      throw error;
    }
  },

  upsert: async (data: {
    product_id: string;
    warehouse_id: string;
    location_id: string;
    on_hand: number;
    free_to_use: number;
    cost_per_unit: number;
  }): Promise<StockLocation | null> => {
    try {
      const response = await api.post<StockItemResponse>('/stock', data);
      return response.stock;
    } catch (error) {
      console.error('Failed to create/update stock:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/stock/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete stock:', error);
      return false;
    }
  },
};
