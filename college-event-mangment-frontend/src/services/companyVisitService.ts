import { api } from './api';

export interface CompanyVisitEligibility {
    department: string[];
    year: number[];
    minCGPA: number;
}

export interface ContactPerson {
    name: string;
    email: string;
    phone: string;
}

export interface CompanyVisit {
    _id: string;
    companyName: string;
    jobRole: string;
    description: string;
    companyLogoUrl?: string;
    eligibility: CompanyVisitEligibility;
    visitDate: string;
    visitTime: string;
    venue: string;
    package: string;
    applicationDeadline: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    contactPerson: ContactPerson;
    createdBy?: {
        _id: string;
        name: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCompanyVisitData {
    companyName: string;
    jobRole: string;
    description: string;
    eligibility: {
        department: string[];
        year: number[];
        minCGPA: number;
    };
    visitDate: string;
    visitTime: string;
    venue: string;
    package: string;
    applicationDeadline: string;
    contactPerson: {
        name: string;
        email: string;
        phone: string;
    };
}

export interface UpdateCompanyVisitData extends Partial<CreateCompanyVisitData> {
    status?: 'scheduled' | 'completed' | 'cancelled';
}

export interface CompanyVisitQueryParams {
    status?: string;
    startDate?: string;
    endDate?: string;
}

class CompanyVisitService {
    /**
     * Get all company visits with optional filters
     */
    async getCompanyVisits(params?: CompanyVisitQueryParams): Promise<CompanyVisit[]> {
        const queryString = params
            ? '?' + new URLSearchParams(params as any).toString()
            : '';

        const response = await api.get(`/company-visits${queryString}`);

        return (response.data as CompanyVisit[]) || [];
    }

    /**
     * Get single company visit by ID
     */
    async getCompanyVisitById(id: string): Promise<CompanyVisit> {
        const response = await api.get(`/company-visits/${id}`);

        return response.data as CompanyVisit;
    }

    /**
     * Update company visit (admin only)
     */
    async updateCompanyVisit(
        id: string,
        data: UpdateCompanyVisitData
    ): Promise<CompanyVisit> {
        const response = await api.put(`/company-visits/${id}`, data);

        return response.data as CompanyVisit;
    }

    /**
     * Update company visit with optional company logo (admin only)
     */
    async updateCompanyVisitWithLogo(
        id: string,
        data: UpdateCompanyVisitData,
        companyLogoFile?: File | null
    ): Promise<CompanyVisit> {
        const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('campus_connect_token');

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'eligibility') {
                formData.append('eligibility', JSON.stringify(value));
                return;
            }
            formData.append(key, String(value));
        });

        if (companyLogoFile) {
            formData.append('companyLogo', companyLogoFile);
        }

        const res = await fetch(`${baseUrl}/company-visits/${id}`, {
            method: 'PUT',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            body: formData,
        });

        const json = await res.json();
        if (!res.ok) {
            throw new Error(json?.message || 'Failed to update company visit');
        }

        return json.data as CompanyVisit;
    }

    /**
     * Get eligible company visits for current student
     */
    async getEligibleCompanyVisits(): Promise<CompanyVisit[]> {
        const response = await api.get('/company-visits/eligible/me');

        return (response.data as CompanyVisit[]) || [];
    }

    /**
     * Create new company visit (admin only)
     */
    async createCompanyVisit(data: CreateCompanyVisitData): Promise<CompanyVisit> {
        const response = await api.post('/company-visits', data);

        return response.data as CompanyVisit;
    }

    /**
     * Create new company visit with optional company logo (admin only)
     */
    async createCompanyVisitWithLogo(
        data: CreateCompanyVisitData,
        companyLogoFile?: File | null
    ): Promise<CompanyVisit> {
        const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('campus_connect_token');

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'eligibility') {
                formData.append('eligibility', JSON.stringify(value));
                return;
            }
            if (key === 'contactPerson') {
                formData.append('contactPerson', JSON.stringify(value));
                return;
            }
            formData.append(key, String(value));
        });

        if (companyLogoFile) {
            formData.append('companyLogo', companyLogoFile);
        }

        const res = await fetch(`${baseUrl}/company-visits`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            body: formData,
        });

        const json = await res.json();
        if (!res.ok) {
            throw new Error(json?.message || 'Failed to create company visit');
        }

        return json.data as CompanyVisit;
    }

    /**
     * Delete company visit (admin only)
     */
    async deleteCompanyVisit(id: string): Promise<void> {
        await api.delete(`/company-visits/${id}`);
    }
}

export const companyVisitService = new CompanyVisitService();
