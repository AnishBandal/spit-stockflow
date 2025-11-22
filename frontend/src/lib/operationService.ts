import { api } from './api';

export interface Operation {
  id: string;
  reference: string;
  type: 'Receipt' | 'Delivery' | 'Internal Transfer' | 'Adjustment';
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
  from_location: string;
  to_location: string;
  contact?: string;
  schedule_date: string;
  responsible_id?: string;
  responsible_name?: string;
  notes?: string;
  items?: OperationItem[];
}

export interface OperationItem {
  id?: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  quantity: number;
}

interface OperationsResponse {
  success: boolean;
  operations: Operation[];
}

interface OperationResponse {
  success: boolean;
  operation: Operation;
  message?: string;
}

export const operationService = {
  getAll: async (params?: { type?: string; status?: string }): Promise<Operation[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get<OperationsResponse>(`/operations${query}`);
      return response.operations;
    } catch (error) {
      console.error('Failed to fetch operations:', error);
      return [];
    }
  },

  getOne: async (id: string): Promise<Operation | null> => {
    try {
      const response = await api.get<OperationResponse>(`/operations/${id}`);
      return response.operation;
    } catch (error) {
      console.error('Failed to fetch operation:', error);
      return null;
    }
  },

  create: async (data: Omit<Operation, 'id' | 'reference' | 'responsible_name'>): Promise<Operation | null> => {
    try {
      const response = await api.post<OperationResponse>('/operations', data);
      return response.operation;
    } catch (error) {
      console.error('Failed to create operation:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Operation>): Promise<Operation | null> => {
    try {
      const response = await api.put<OperationResponse>(`/operations/${id}`, data);
      return response.operation;
    } catch (error) {
      console.error('Failed to update operation:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/operations/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete operation:', error);
      return false;
    }
  },

  complete: async (id: string): Promise<boolean> => {
    try {
      await api.post(`/operations/${id}/complete`);
      return true;
    } catch (error) {
      console.error('Failed to complete operation:', error);
      throw error;
    }
  },
};
