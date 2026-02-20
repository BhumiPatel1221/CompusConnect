import { api, ApiResponse } from './api';

export interface EventEligibility {
    department: string[];
    year: number[];
}

export interface Event {
    _id: string;
    title: string;
    description: string;
    category: 'technical' | 'cultural' | 'sports' | 'placement';
    date: string;
    time: string;
    venue: string;
    eligibility: EventEligibility;
    maxCapacity: number;
    registrationCount: number;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    createdBy: {
        _id: string;
        name: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateEventData {
    title: string;
    description: string;
    category: string;
    date: string;
    time: string;
    venue: string;
    eligibility: {
        department: string[];
        year: number[];
    };
    maxCapacity: number;
}

export interface UpdateEventData extends Partial<CreateEventData> {
    status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventQueryParams {
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}

class EventService {
    /**
     * Get all events with optional filters
     */
    async getEvents(params?: EventQueryParams): Promise<Event[]> {
        const queryString = params
            ? '?' + new URLSearchParams(params as any).toString()
            : '';

        const response = await api.get(`/events${queryString}`);

        return (response.data as Event[]) || [];
    }

    /**
     * Get single event by ID
     */
    async getEventById(id: string): Promise<Event> {
        const response = await api.get(`/events/${id}`);

        return response.data as Event;
    }

    /**
     * Get recommended events for current student
     */
    async getRecommendedEvents(): Promise<Event[]> {
        const response = await api.get('/events/recommendations/me');

        return (response.data as Event[]) || [];
    }

    /**
     * Create new event (admin only)
     */
    async createEvent(data: CreateEventData): Promise<Event> {
        const response = await api.post('/events', data);

        return response.data as Event;
    }

    /**
     * Update event (admin only)
     */
    async updateEvent(id: string, data: UpdateEventData): Promise<Event> {
        const response = await api.put(`/events/${id}`, data);

        return response.data as Event;
    }

    /**
     * Delete event (admin only)
     */
    async deleteEvent(id: string): Promise<void> {
        await api.delete(`/events/${id}`);
    }
}

export const eventService = new EventService();
