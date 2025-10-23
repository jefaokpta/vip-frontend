/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/22/25
 */

import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {
    Assistant,
    AssistantAnalysis,
    Cdr,
    Company,
    Guideline,
    LoginResponse,
    Recognition,
    UpdateAttendant,
    User,
    UserFieldEnum,
    VoiceAssistant
} from '@/types/types';
import {firstValueFrom, Observable, timeout} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class HttpClientService {
    private readonly BACKEND = environment.API_BACKEND_URL;
    private readonly HTTP_TIMEOUT = 30_000;
    private readonly HTTP_LONG_TIMEOUT = 300_000;
    private readonly BEARER = 'Bearer ';

    constructor(private readonly http: HttpClient) {}

    authenticate(email: string, password: string): Promise<LoginResponse> {
        return this.executeRequest(this.http.post<LoginResponse>(`${this.BACKEND}/users/login`, { email, password }));
    }

    validateToken() {
        return this.executeRequest(
            this.http.get<{ token: string }>(`${this.BACKEND}/auth/validate-token`, this.headers())
        );
    }

    getCallToken(): Promise<LoginResponse> {
        return this.executeRequest(this.http.get<LoginResponse>(`${this.BACKEND}/auth/call-token`, this.headers()));
    }

    findAllCdr(): Promise<Cdr[]> {
        return this.executeRequest(this.http.get<Cdr[]>(`${this.BACKEND}/cdr`, this.headers()));
    }

    findAllCdrByMonth(date: Date): Promise<Cdr[]> {
        const m = date.getMonth();
        const y = date.getFullYear();
        return this.executeRequest(this.http.get<Cdr[]>(`${this.BACKEND}/cdr/reports/${y}/${m}`, this.headers()));
    }

    findCdrById(id: string): Promise<Cdr> {
        return this.executeRequest(this.http.get<Cdr>(`${this.BACKEND}/cdr/${id}`, this.headers()));
    }

    findRecognitions(cdrId: string): Promise<Recognition> {
        return this.executeRequest(this.http.get<Recognition>(`${this.BACKEND}/recognitions/${cdrId}`, this.headers()));
    }

    retryAnalyze(cdrId: number) {
        return this.executeRequest(this.http.get(`${this.BACKEND}/recognitions/retry/${cdrId}`, this.headers()));
    }

    notifyUploadToBackend(userId: number, callRecord: string) {
        return this.executeRequest(
            this.http.post(`${this.BACKEND}/cdr/upload`, { id: userId, callRecord }, this.headers())
        );
    }

    findOneCompany(id: string): Promise<Company> {
        return this.executeRequest(this.http.get<Company>(`${this.BACKEND}/companies/${id}`, this.headers()));
    }

    findOneCompanyByControlNumber(controlNumber: string): Promise<Company> {
        return this.executeRequest(
            this.http.get<Company>(`${this.BACKEND}/companies/cn/${controlNumber}`, this.headers())
        );
    }

    updateCompany(company: Company) {
        return this.executeRequest(
            this.http.put<Company>(`${this.BACKEND}/companies/${company.id}`, company, this.headers())
        );
    }

    findAllCompanies(): Promise<Company[]> {
        return this.executeRequest(this.http.get<Company[]>(`${this.BACKEND}/companies`, this.headers()));
    }

    createCompany(company: Company) {
        return this.executeRequest(this.http.post(`${this.BACKEND}/companies`, company, this.headers()));
    }

    findGuideline(): Promise<Guideline[]> {
        return this.executeRequest(this.http.get<Guideline[]>(`${this.BACKEND}/guidelines`, this.headers()));
    }

    updateCompanyAttendants(updateAttendant: UpdateAttendant, phone: string) {
        return this.executeRequest(
            this.http.patch(`${this.BACKEND}/companies/phones/${phone}/attendants`, updateAttendant, this.headers())
        );
    }

    updateGuideline(guideline: Guideline) {
        return this.executeRequest(this.http.post(`${this.BACKEND}/guidelines`, guideline, this.headers()));
    }

    findAssistants(userId: number): Promise<Assistant[]> {
        return this.executeRequest(
            this.http.get<Assistant[]>(`${this.BACKEND}/assistants/user/${userId}`, this.headers())
        );
    }

    listAssistants(controlNumber: string, userId: number): Promise<Assistant[]> {
        return this.executeRequest(
            this.http.get<Assistant[]>(
                `${this.BACKEND}/assistants/company/${controlNumber}/user/${userId}`,
                this.headers()
            )
        );
    }

    findAllVoiceAssistants(): Promise<VoiceAssistant[]> {
        return this.executeRequest(this.http.get<VoiceAssistant[]>(`${this.BACKEND}/vapi`, this.headers()));
    }

    updateTestAssistantPhoneNumber(vapiAssistantId: string) {
        return this.executeRequest(
            this.http.patch(`${this.BACKEND}/vapi/phone-numbers/${vapiAssistantId}`, {}, this.headers())
        );
    }

    createAssistant(assistant: Assistant) {
        return this.executeRequest(this.http.post(`${this.BACKEND}/assistants`, assistant, this.headers()));
    }

    createVoiceAssistant(assistant: VoiceAssistant) {
        return this.executeRequest(this.http.post(`${this.BACKEND}/vapi`, assistant, this.headers()));
    }

    findAssistantById(id: string): Promise<Assistant> {
        return this.executeRequest(this.http.get<Assistant>(`${this.BACKEND}/assistants/${id}`, this.headers()));
    }

    findVoiceAssistantById(id: string): Promise<VoiceAssistant> {
        return this.executeRequest(this.http.get<VoiceAssistant>(`${this.BACKEND}/vapi/${id}`, this.headers()));
    }

    updateAssistant(assistant: Assistant) {
        return this.executeRequest(
            this.http.patch(`${this.BACKEND}/assistants/${assistant.id}`, assistant, this.headers())
        );
    }

    updateVoiceAssistant(assistant: VoiceAssistant) {
        return this.executeRequest(this.http.put(`${this.BACKEND}/vapi/${assistant.id}`, assistant, this.headers()));
    }

    deleteAssistant(id: number) {
        this.executeRequest(this.http.delete<void>(`${this.BACKEND}/assistants/${id}`, this.headers()));
    }

    deleteVoiceAssistant(id: number) {
        this.executeRequest(this.http.delete<void>(`${this.BACKEND}/vapi/${id}`, this.headers()));
    }

    assistantAnalysis(assistantId: number, uniqueId: string, userfield: UserFieldEnum): Promise<AssistantAnalysis> {
        return this.executeLongRequest(
            this.http.post<AssistantAnalysis>(
                `${this.BACKEND}/assistants/analysis`,
                {
                    assistantId,
                    uniqueId,
                    userfield
                },
                this.headers()
            )
        );
    }

    findAllUsers(): Promise<User[]> {
        return this.executeRequest(this.http.get<User[]>(`${this.BACKEND}/users/cn/security`, this.headers()));
    }

    findOneUser(id: number): Promise<User> {
        return this.executeRequest(this.http.get<User>(`${this.BACKEND}/users/${id}`, this.headers()));
    }

    updateUser(user: Partial<User>) {
        return this.executeRequest(this.http.patch(`${this.BACKEND}/users/${user.id}`, user, this.headers()));
    }

    updateProfile(profile: { name: string; passwordArray: string[] }): Promise<LoginResponse> {
        const payload = {
            name: profile.name,
            oldPassword: profile.passwordArray[0],
            newPassword: profile.passwordArray[1]
        };
        return this.executeRequest(
            this.http.patch<LoginResponse>(`${this.BACKEND}/users/profile/update`, payload, this.headers())
        );
    }

    createUser(user: User) {
        return this.executeRequest(this.http.post<User>(`${this.BACKEND}/users`, user, this.headers()));
    }

    forgotPassword(email: string) {
        return this.executeRequest(this.http.post(`${this.BACKEND}/users/forgot/password`, { email }, this.headers()));
    }

    manageCompany(controlNumber: number): Promise<LoginResponse> {
        return this.executeRequest(
            this.http.post<LoginResponse>(`${this.BACKEND}/users/manage`, { controlNumber }, this.headers())
        );
    }

    exitManageCompany(user: User): Promise<LoginResponse> {
        return this.executeRequest(
            this.http.post<LoginResponse>(
                `${this.BACKEND}/users/manage/exit`,
                { controlNumber: user.controlNumber },
                this.headers()
            )
        );
    }

    confirmUserEmail(email: string, confirmationCode: string) {
        return this.executeRequest(
            this.http.post(`${this.BACKEND}/users/confirm`, { email, confirmationCode }, this.headers())
        );
    }

    createResetUserPassword(payload: { email: string; password: string; confirmationCode?: string }) {
        return this.executeRequest(this.http.post(`${this.BACKEND}/users/create/password`, payload, this.headers()));
    }

    deleteUser(id: number) {
        return this.executeRequest(this.http.delete(`${this.BACKEND}/users/${id}`, this.headers()));
    }

    migrateUser(user: User, company: Company) {
        return this.executeRequest(
            this.http.post(
                `${this.BACKEND}/users/migrate`,
                { user, newControlNumber: company.controlNumber },
                this.headers()
            )
        );
    }


    /**
     * Executa uma requisição HTTP com timeout e retorna a primeira resposta como Promise
     * @param request Observable da requisição HTTP
     * @returns Promise com resultado da requisição
     */
    private executeRequest<T>(request: Observable<T>): Promise<T> {
        return firstValueFrom(request.pipe(timeout(this.HTTP_TIMEOUT)));
    }

    private executeLongRequest<T>(request: Observable<T>): Promise<T> {
        return firstValueFrom(request.pipe(timeout(this.HTTP_LONG_TIMEOUT)));
    }

    private headers() {
        return {
            headers: {
                Authorization: this.BEARER + localStorage.getItem('token')
            }
        };
    }
}
