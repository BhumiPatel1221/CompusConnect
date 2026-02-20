import { api } from "./api";
import { Event } from "./eventService";

export interface RecommendedEventDto {
  eventId: string;
  eventName: string;
  matchScore: number;
  reasons: string[];
  event: Event;
}

class RecommendationService {
  async getStudentRecommendations(studentId: string): Promise<RecommendedEventDto[]> {
    const response = await api.get(`/recommendations/${studentId}`);
    return (response.data as RecommendedEventDto[]) || [];
  }
}

export const recommendationService = new RecommendationService();
