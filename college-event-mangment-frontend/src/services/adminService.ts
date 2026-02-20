import { api } from './api';

export interface AdminStats {
  totalEvents: number;
  totalCompanyVisits: number;
  totalStudents: number;
  totalRegistrations: number;
  totalApplications: number;
}

class AdminService {
  async getStats(): Promise<AdminStats> {
    const response = await api.get('/admin/stats');
    return response.data as AdminStats;
  }
}

export const adminService = new AdminService();
