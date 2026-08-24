import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Survey } from '@/pabx/types/survey';

@Injectable({ providedIn: 'root' })
export class SurveyService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Survey[]> {
        return executeRequest(this.http.get<Survey[]>(`${this.BACKEND}/surveys`, httpHeaders()));
    }

    findById(id: string): Promise<Survey> {
        return executeRequest(this.http.get<Survey>(`${this.BACKEND}/surveys/${id}`, httpHeaders()));
    }

    create(survey: Partial<Survey>): Promise<Survey> {
        return executeRequest(this.http.post<Survey>(`${this.BACKEND}/surveys`, survey, httpHeaders()));
    }

    update(survey: Survey): Promise<void> {
        return executeRequest(this.http.put<void>(`${this.BACKEND}/surveys/${survey.id}`, survey, httpHeaders()));
    }

    delete(id: number): Promise<void> {
        return executeRequest(this.http.delete<void>(`${this.BACKEND}/surveys/${id}`, httpHeaders()));
    }
}
