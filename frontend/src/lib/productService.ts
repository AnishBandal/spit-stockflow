import { api } from './api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_of_measure: string;
  total_stock: number;
  reorder_level: number;
  status: 'Normal' | 'Low' | 'Out of Stock';
  description?: string;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
}

interface ProductResponse {
  success: boolean;
  product: Product;
  message?: string;
}

interface CategoriesResponse {
  success: boolean;
  categories: string[];
}

export const productService = {
  getAll: async (params?: { category?: string; search?: string }): Promise<Product[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get<ProductsResponse>(`/products${query}`);
      return response.products;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  },

  getOne: async (id: string): Promise<Product | null> => {
    try {
      const response = await api.get<ProductResponse>(`/products/${id}`);
      return response.product;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  },

  create: async (data: Omit<Product, 'id' | 'total_stock' | 'status'>): Promise<Product | null> => {
    try {
      const response = await api.post<ProductResponse>('/products', data);
      return response.product;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Product>): Promise<Product | null> => {
    try {
      const response = await api.put<ProductResponse>(`/products/${id}`, data);
      return response.product;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/products/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete product:', error);
      return false;
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get<CategoriesResponse>('/products/categories');
      return response.categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },
};
