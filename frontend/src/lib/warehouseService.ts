import { api } from './api';

export interface Warehouse {
  id: string;
  name: string;
  short_code: string;
  address: string;
}

interface WarehousesResponse {
  success: boolean;
  warehouses: Warehouse[];
}

interface WarehouseResponse {
  success: boolean;
  warehouse: Warehouse;
  message?: string;
}

export const warehouseService = {
  getAll: async (): Promise<Warehouse[]> => {
    try {
      const response = await api.get<WarehousesResponse>('/warehouses');
      return response.warehouses;
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
      return [];
    }
  },

  getOne: async (id: string): Promise<Warehouse | null> => {
    try {
      const response = await api.get<WarehouseResponse>(`/warehouses/${id}`);
      return response.warehouse;
    } catch (error) {
      console.error('Failed to fetch warehouse:', error);
      return null;
    }
  },

  create: async (data: Omit<Warehouse, 'id'>): Promise<Warehouse | null> => {
    try {
      const response = await api.post<WarehouseResponse>('/warehouses', data);
      return response.warehouse;
    } catch (error) {
      console.error('Failed to create warehouse:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Warehouse>): Promise<Warehouse | null> => {
    try {
      const response = await api.put<WarehouseResponse>(`/warehouses/${id}`, data);
      return response.warehouse;
    } catch (error) {
      console.error('Failed to update warehouse:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/warehouses/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete warehouse:', error);
      return false;
    }
  },
};
