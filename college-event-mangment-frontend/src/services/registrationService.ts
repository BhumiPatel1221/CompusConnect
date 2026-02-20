import { api } from './api';

export interface Registration {
    _id: string;
    event: {
        _id: string;
        title: string;
        date: string;
        time: string;
        venue: string;
        category: string;
    };
    student: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'registered' | 'attended' | 'cancelled';
    registrationDate: string;
    feedback?: {
        rating: number;
        comment: string;
    };
}

export interface CreateRegistrationData {
    eventId: string;
}

export interface UpdateRegistrationStatusData {
    status: 'registered' | 'attended' | 'cancelled';
}

export interface AddFeedbackData {
    rating: number;
    comment: string;
}

export interface RegistrationAnalytics {
    totalEventRegistrations: number;
    registrationsPerEvent: { eventId: string; title: string; count: number }[];
}

class RegistrationService {
    /**
     * Register for an event (student only)
     */
    async registerForEvent(data: CreateRegistrationData): Promise<Registration> {
        const response = await api.post('/registrations', data);

        return response.data as Registration;
    }

    /**
     * Get my registrations (student only)
     */
    async getMyRegistrations(): Promise<Registration[]> {
        const response = await api.get('/registrations/my-registrations');

        return (response.data as Registration[]) || [];
    }

    async getAnalytics(): Promise<RegistrationAnalytics> {
        const response = await api.get('/registrations/analytics');
        return response.data as RegistrationAnalytics;
    }

    /**
     * Get registrations for a specific event (admin only)
     */
    async getEventRegistrations(eventId: string): Promise<Registration[]> {
        const response = await api.get(`/registrations/event/${eventId}`);

        return (response.data as Registration[]) || [];
    }

    /**
     * Get registrations for a specific event via alias route (admin only)
     */
    async getEventRegistrationsByAlias(eventId: string): Promise<Registration[]> {
        const response = await api.get(`/event/${eventId}/registrations`);

        return (response.data as Registration[]) || [];
    }

    /**
     * Cancel registration (student only)
     */
    async cancelRegistration(registrationId: string): Promise<void> {
        await api.delete(`/registrations/${registrationId}`);
    }

    /**
     * Update registration status (admin only)
     */
    async updateRegistrationStatus(
        registrationId: string,
        data: UpdateRegistrationStatusData
    ): Promise<Registration> {
        const response = await api.put(
            `/registrations/${registrationId}/status`,
            data
        );

        return response.data as Registration;
    }

    /**
     * Add feedback to registration (student only)
     */
    async addFeedback(
        registrationId: string,
        data: AddFeedbackData
    ): Promise<Registration> {
        const response = await api.put(
            `/registrations/${registrationId}/feedback`,
            data
        );

        return response.data as Registration;
    }

    /**
     * Check if already registered for an event
     */
    async isRegisteredForEvent(eventId: string): Promise<boolean> {
        try {
            const registrations = await this.getMyRegistrations();
            return registrations.some(
                (reg) => reg.event._id === eventId && reg.status !== 'cancelled'
            );
        } catch {
            return false;
        }
    }
}

export const registrationService = new RegistrationService();
