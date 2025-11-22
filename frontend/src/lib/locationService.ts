import { api } from './api';

export interface Location {
  id: string;
  name: string;
  short_code: string;
  warehouse_id: string;
  warehouse_name?: string;
}

interface LocationsResponse {
  success: boolean;
  locations: Location[];
}

interface LocationResponse {
  success: boolean;
  location: Location;
  message?: string;
}

export const locationService = {
  getAll: async (warehouseId?: string): Promise<Location[]> => {
    try {
      const query = warehouseId ? `?warehouse_id=${warehouseId}` : '';
      const response = await api.get<LocationsResponse>(`/locations${query}`);
      return response.locations;
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      return [];
    }
  },

  getOne: async (id: string): Promise<Location | null> => {
    try {
      const response = await api.get<LocationResponse>(`/locations/${id}`);
      return response.location;
    } catch (error) {
      console.error('Failed to fetch location:', error);
      return null;
    }
  },

  create: async (data: Omit<Location, 'id'>): Promise<Location | null> => {
    try {
      const response = await api.post<LocationResponse>('/locations', data);
      return response.location;
    } catch (error) {
      console.error('Failed to create location:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Location>): Promise<Location | null> => {
    try {
      const response = await api.put<LocationResponse>(`/locations/${id}`, data);
      return response.location;
    } catch (error) {
      console.error('Failed to update location:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/locations/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete location:', error);
      return false;
    }
  },
};
