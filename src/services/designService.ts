import api from './api';
import { Design, Fabric, DesignFilters, PaginatedResponse, ApiResponse } from '@/types';

export const designService = {
  // Design APIs
  async getDesigns(
    filters?: DesignFilters,
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Design>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.country) params.append('country', filters.country);
      if (filters.designer) params.append('designer', filters.designer);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag));
    }

    const response = await api.get<ApiResponse<PaginatedResponse<Design>>>(
      `/designs?${params.toString()}`
    );
    return response.data.data;
  },

  async getDesignById(id: string): Promise<Design> {
    const response = await api.get<ApiResponse<Design>>(`/designs/${id}`);
    return response.data.data;
  },

  async getFeaturedDesigns(limit = 6): Promise<Design[]> {
    const response = await api.get<ApiResponse<Design[]>>(
      `/designs/featured?limit=${limit}`
    );
    return response.data.data;
  },

  async createDesign(data: Partial<Design>): Promise<Design> {
    const response = await api.post<ApiResponse<Design>>('/designs', data);
    return response.data.data;
  },

  async updateDesign(id: string, data: Partial<Design>): Promise<Design> {
    const response = await api.patch<ApiResponse<Design>>(`/designs/${id}`, data);
    return response.data.data;
  },

  async deleteDesign(id: string): Promise<void> {
    await api.delete(`/designs/${id}`);
  },

  // Fabric APIs
  async getFabrics(page = 1, limit = 12): Promise<PaginatedResponse<Fabric>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Fabric>>>(
      `/fabrics?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  async getFabricById(id: string): Promise<Fabric> {
    const response = await api.get<ApiResponse<Fabric>>(`/fabrics/${id}`);
    return response.data.data;
  },

  async createFabric(data: Partial<Fabric>): Promise<Fabric> {
    const response = await api.post<ApiResponse<Fabric>>('/fabrics', data);
    return response.data.data;
  },

  async updateFabric(id: string, data: Partial<Fabric>): Promise<Fabric> {
    const response = await api.patch<ApiResponse<Fabric>>(`/fabrics/${id}`, data);
    return response.data.data;
  },

  async deleteFabric(id: string): Promise<void> {
    await api.delete(`/fabrics/${id}`);
  },
};
