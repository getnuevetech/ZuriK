import api from './api';
import {
  Design,
  Fabric,
  DesignFilters,
  FabricFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const designService = {
  /**
   * Get all designs with filters
   */
  async getDesigns(filters?: DesignFilters): Promise<PaginatedResponse<Design>> {
    const response = await api.get<PaginatedResponse<Design>>('/designs', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single design by ID
   */
  async getDesignById(id: string): Promise<Design> {
    const response = await api.get<Design>(`/designs/${id}`);
    return response.data;
  },

  /**
   * Create new design (Designer only)
   */
  async createDesign(data: Partial<Design>): Promise<Design> {
    const response = await api.post<Design>('/designs', data);
    return response.data;
  },

  /**
   * Update design (Designer only)
   */
  async updateDesign(id: string, data: Partial<Design>): Promise<Design> {
    const response = await api.patch<Design>(`/designs/${id}`, data);
    return response.data;
  },

  /**
   * Delete design (Designer only)
   */
  async deleteDesign(id: string): Promise<void> {
    await api.delete(`/designs/${id}`);
  },
};

export const fabricService = {
  /**
   * Get all fabrics with filters
   */
  async getFabrics(filters?: FabricFilters): Promise<PaginatedResponse<Fabric>> {
    const response = await api.get<PaginatedResponse<Fabric>>('/fabrics', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single fabric by ID
   */
  async getFabricById(id: string): Promise<Fabric> {
    const response = await api.get<Fabric>(`/fabrics/${id}`);
    return response.data;
  },

  /**
   * Create new fabric (Fabric Seller only)
   */
  async createFabric(data: Partial<Fabric>): Promise<Fabric> {
    const response = await api.post<Fabric>('/fabrics', data);
    return response.data;
  },

  /**
   * Update fabric (Fabric Seller only)
   */
  async updateFabric(id: string, data: Partial<Fabric>): Promise<Fabric> {
    const response = await api.patch<Fabric>(`/fabrics/${id}`, data);
    return response.data;
  },

  /**
   * Delete fabric (Fabric Seller only)
   */
  async deleteFabric(id: string): Promise<void> {
    await api.delete(`/fabrics/${id}`);
  },
};
