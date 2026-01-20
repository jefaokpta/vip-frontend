/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/22/25
 */

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '@/types/types';
import { Injectable, signal } from '@angular/core';
import { executeRequest, httpHeaders } from '@/util/utils';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly user = signal(this.extractUserFromToken());
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

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
        globalThis.location.href = '/';
    }

    async refreshToken() {
        const payload = await this.validateToken();
        this.setUser(payload.token);
    }

    async manageOtherCompany(controlNumber: number) {
        const response = await executeRequest(
            this.http.post<LoginResponse>(`${this.BACKEND}/users/manage`, { controlNumber }, httpHeaders())
        );
        return this.setUser(response.token);
    }

    async exitManageCompany() {
        const response = await executeRequest(
            this.http.post<LoginResponse>(
                `${this.BACKEND}/users/manage/exit`,
                { controlNumber: this.getUser().companyId },
                httpHeaders()
            )
        );
        return this.setUser(response.token);
    }

    async updateProfile(profile: { name: string; email: string; passwordArray: string[] }) {
        const payload = {
            name: profile.name,
            email: profile.email,
            previousPassword: profile.passwordArray[0],
            newPassword: profile.passwordArray[1]
        };
        const loginResponse = await executeRequest(
            this.http.put<LoginResponse>(`${this.BACKEND}/users/profile`, payload, httpHeaders())
        );
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
                sub: '',
                companyId: '',
                isConfirmed: false,
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
        const currentDate = Date.now();
        return currentDate - userCreatedAt > FIVE_DAYS_IN_MS;
    }

    authenticate(email: string, password: string): Promise<LoginResponse> {
        return executeRequest(
            this.http.post<LoginResponse>(`${this.BACKEND}/auth/login`, {
                email,
                password
            })
        );
    }

    private validateToken() {
        return executeRequest(this.http.get<{ token: string }>(`${this.BACKEND}/security/validate`, httpHeaders()));
    }

    findAll(): Promise<User[]> {
        return executeRequest(this.http.get<User[]>(`${this.BACKEND}/users`, httpHeaders()));
    }

    findById(id: string): Promise<User> {
        return executeRequest(this.http.get<User>(`${this.BACKEND}/users/${id}`, httpHeaders()));
    }

    update(user: User) {
        return executeRequest(this.http.put(`${this.BACKEND}/users`, user, httpHeaders()));
    }

    create(user: User) {
        return executeRequest(this.http.post<User>(`${this.BACKEND}/users`, user, httpHeaders()));
    }

    forgotPassword(email: string) {
        return executeRequest(this.http.post(`${this.BACKEND}/users/forgot/password`, { email }, httpHeaders()));
    }

    confirmUserEmail(email: string, confirmationCode: string) {
        return executeRequest(
            this.http.post(`${this.BACKEND}/users/confirm`, { email, confirmationCode }, httpHeaders())
        );
    }

    createResetUserPassword(payload: { email: string; password: string; confirmationCode?: string }) {
        return executeRequest(this.http.post(`${this.BACKEND}/users/create/password`, payload, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/users/${id}`, httpHeaders()));
    }
}
