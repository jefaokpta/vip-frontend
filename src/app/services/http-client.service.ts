/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/22/25
 */

import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Company, LoginResponse, User, Worker} from '@/types/types';
import {Injectable} from '@angular/core';
import {executeRequest, httpHeaders} from "@/util/utils";
import {Peer} from '@/pabx/types';

@Injectable({
    providedIn: 'root'
})
export class HttpClientService {
    private readonly BACKEND = environment.API_BACKEND_URL;
    private readonly REQUEST_TIMEOUT = 30_000;


    constructor(private readonly http: HttpClient) {
    }

    authenticate(email: string, password: string): Promise<LoginResponse> {
        return executeRequest(this.http.post<LoginResponse>(`${this.BACKEND}/users/login`, {
            email,
            password
        }), this.REQUEST_TIMEOUT);
    }

    validateToken() {
        return executeRequest(
            this.http.get<{ token: string }>(`${this.BACKEND}/auth/validate-token`, httpHeaders())
        );
    }

    findOneCompany(id: string): Promise<Company> {
        return executeRequest(this.http.get<Company>(`${this.BACKEND}/companies/${id}`, httpHeaders()));
    }

    findOneCompanyByControlNumber(controlNumber: string): Promise<Company> {
        return executeRequest(this.http.get<Company>(`${this.BACKEND}/companies/cn/${controlNumber}`, httpHeaders()));
    }

    updateCompany(company: Company) {
        return executeRequest(
            this.http.put<Company>(`${this.BACKEND}/companies/${company.id}`, company, httpHeaders())
        );
    }

    findAllCompanies(): Promise<Company[]> {
        return executeRequest(this.http.get<Company[]>(`${this.BACKEND}/companies`, httpHeaders()));
    }

    createCompany(company: Company) {
        return executeRequest(this.http.post(`${this.BACKEND}/companies`, company, httpHeaders()));
    }

    findAllUsers(): Promise<User[]> {
        return executeRequest(this.http.get<User[]>(`${this.BACKEND}/users/cn/security`, httpHeaders()));
    }

    findOneUser(id: number): Promise<User> {
        return executeRequest(this.http.get<User>(`${this.BACKEND}/users/${id}`, httpHeaders()));
    }

    updateUser(user: Partial<User>) {
        return executeRequest(this.http.patch(`${this.BACKEND}/users/${user.id}`, user, httpHeaders()));
    }

    updateProfile(profile: { name: string; passwordArray: string[] }): Promise<LoginResponse> {
        const payload = {
            name: profile.name,
            oldPassword: profile.passwordArray[0],
            newPassword: profile.passwordArray[1]
        };
        return executeRequest(
            this.http.patch<LoginResponse>(`${this.BACKEND}/users/profile/update`, payload, httpHeaders())
        );
    }

    createUser(user: User) {
        return executeRequest(this.http.post<User>(`${this.BACKEND}/users`, user, httpHeaders()));
    }

    forgotPassword(email: string) {
        return executeRequest(this.http.post(`${this.BACKEND}/users/forgot/password`, {email}, httpHeaders()));
    }

    manageCompany(controlNumber: number): Promise<LoginResponse> {
        return executeRequest(
            this.http.post<LoginResponse>(`${this.BACKEND}/users/manage`, {controlNumber}, httpHeaders())
        );
    }

    exitManageCompany(user: User): Promise<LoginResponse> {
        return executeRequest(
            this.http.post<LoginResponse>(
                `${this.BACKEND}/users/manage/exit`,
                { controlNumber: user.controlNumber },
                httpHeaders()
            )
        );
    }

    confirmUserEmail(email: string, confirmationCode: string) {
        return executeRequest(
            this.http.post(`${this.BACKEND}/users/confirm`, {email, confirmationCode}, httpHeaders())
        );
    }

    createResetUserPassword(payload: { email: string; password: string; confirmationCode?: string }) {
        return executeRequest(this.http.post(`${this.BACKEND}/users/create/password`, payload, httpHeaders()));
    }

    deleteUser(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/users/${id}`, httpHeaders()));
    }

    migrateUser(user: User, company: Company) {
        return executeRequest(
            this.http.post(
                `${this.BACKEND}/users/migrate`,
                { user, newControlNumber: company.controlNumber },
                httpHeaders()
            )
        );
    }

    findWorkers(): Promise<Worker[]> {
        return executeRequest(this.http.get<Worker[]>(`${this.BACKEND}/workers`, httpHeaders()));
    }

    findPeersByCompany(companyId: string): Promise<Peer[]> {
        return executeRequest(this.http.get<Peer[]>(`${this.BACKEND}/peers/${companyId}`, httpHeaders()));
    }

}
