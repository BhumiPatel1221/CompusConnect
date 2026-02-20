import { api, setToken, removeToken, ApiResponse } from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'admin';
    department?: string;
    year?: string;
    interests?: string[];
    organization?: string;
    position?: string;
}

export interface UpdateProfileData {
    name?: string;
    email?: string;
    department?: string;
    year?: string;
    interests?: string[];
    organization?: string;
    position?: string;
}

export interface UpdatePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    department?: string;
    year?: string;
    interests?: string[];
    organization?: string;
    position?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: AuthUser;
}

class AuthService {
    /**
     * Register a new user (student or admin)
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', data);

        if (response.token) {
            setToken(response.token);
            localStorage.setItem('campus_connect_user', JSON.stringify(response.user));
        }

        return response as AuthResponse;
    }

    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);

        if (response.token) {
            setToken(response.token);
            localStorage.setItem('campus_connect_user', JSON.stringify(response.user));
        }

        return response as AuthResponse;
    }

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<AuthUser> {
        const response = await api.get('/auth/me');
        return response.data as AuthUser;
    }

    /**
     * Update user profile
     */
    async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
        const response = await api.put('/auth/updateprofile', data);

        // Update stored user data
        if (response.data) {
            localStorage.setItem('campus_connect_user', JSON.stringify(response.data));
        }

        return response.data as AuthUser;
    }

    /**
     * Update password
     */
    async updatePassword(data: UpdatePasswordData): Promise<void> {
        await api.put('/auth/updatepassword', data);
    }

    /**
     * Logout user
     */
    logout(): void {
        removeToken();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('campus_connect_token');
    }

    /**
     * Get stored user from localStorage
     */
    getStoredUser(): AuthUser | null {
        const userStr = localStorage.getItem('campus_connect_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }
}

export const authService = new AuthService();
