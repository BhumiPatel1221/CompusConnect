import { api } from './api';
import { CompanyVisit } from './companyVisitService';

export interface CompanyVisitApplication {
    _id: string;
    companyVisit: CompanyVisit;
    student: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'applied' | 'cancelled';
    appliedAt: string;
}

class CompanyVisitApplicationService {
    async apply(companyVisitId: string): Promise<CompanyVisitApplication> {
        const response = await api.post('/company-visit-applications', { companyVisitId });
        return response.data as CompanyVisitApplication;
    }

    async getMyApplications(): Promise<CompanyVisitApplication[]> {
        const response = await api.get('/company-visit-applications/my');
        return (response.data as CompanyVisitApplication[]) || [];
    }

    async cancel(applicationId: string): Promise<void> {
        await api.delete(`/company-visit-applications/${applicationId}`);
    }

    async getAnalytics(): Promise<any> {
        const response = await api.get('/company-visit-applications/analytics');
        return response.data;
    }

    async getApplicationsForCompanyVisit(companyVisitId: string): Promise<CompanyVisitApplication[]> {
        const response = await api.get(`/company-visits/${companyVisitId}/applications`);
        return (response.data as CompanyVisitApplication[]) || [];
    }

    async getApplicationsForCompanyVisitByAlias(companyVisitId: string): Promise<CompanyVisitApplication[]> {
        const response = await api.get(`/company/${companyVisitId}/applications`);
        return (response.data as CompanyVisitApplication[]) || [];
    }
}

export const companyVisitApplicationService = new CompanyVisitApplicationService();
