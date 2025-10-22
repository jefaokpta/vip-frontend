import { Injectable, signal } from '@angular/core';
import { User } from '@/types/types';
import { jwtDecode } from 'jwt-decode';
import { HttpClientService } from '@/services/http-client.service';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly user = signal(this.extractUserFromToken());

    constructor(private readonly httpClientService: HttpClientService) {}

    getUserReactive() {
        return this.user.asReadonly();
    }

    getUser() {
        return this.extractUserFromToken();
    }

    loginSuccess(token: string) {
        this.setUser(token);
    }

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    async refreshToken() {
        const payload = await this.httpClientService.validateToken();
        this.setUser(payload.token)
    }

    async manageCompany(controlNumber: number) {
        const response = await this.httpClientService.manageCompany(controlNumber);
        return this.setUser(response.token);
    }

    async exitManageCompany() {
        const response = await this.httpClientService.exitManageCompany(this.getUser());
        return this.setUser(response.token);
    }

    async updateProfile(profile: { name: string; passwordArray: string[] }) {
        const loginResponse = await this.httpClientService.updateProfile(profile);
        this.setUser(loginResponse.token);
    }

    setUserSettings(darkMode?: boolean) {
        const settings = { darkMode };
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    getUserSettings(): { darkMode: boolean } {
        return JSON.parse(localStorage.getItem('settings') ?? '{}');
    }

    private setUser(token: string) {
        localStorage.setItem('token', token);
        this.user.set(this.extractUserFromToken());
    }

    private extractUserFromToken(): User {
        const token = localStorage.getItem('token')!;
        if (!token)
            return {
                id: 0,
                name: '',
                email: '',
                controlNumber: '',
                ddr: '',
                isExpired: true,
                createdAt: new Date(),
                roles: []
            };
        const payload = jwtDecode<User>(token);
        return { ...payload, isExpired: this.isUserExpired(payload) };
    }

    isUserExpired(user: User): boolean {
        if (user.roles.length > 1) {
            return false;
        }
        const FIVE_DAYS_IN_MS = 5 * 24 * 60 * 60 * 1000;
        const userCreatedAt = new Date(user.createdAt).getTime();
        const currentDate = new Date().getTime();
        return currentDate - userCreatedAt > FIVE_DAYS_IN_MS;
    }
}
