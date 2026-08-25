import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { SurveyResponse } from '@/pabx/types/survey-response';

@Injectable({ providedIn: 'root' })
export class SurveyReportService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findLastResponses(surveyId: number): Promise<SurveyResponse[]> {
        return executeRequest(
            this.http.get<SurveyResponse[]>(`${this.BACKEND}/surveys/${surveyId}/responses/last`, httpHeaders()),
            10_000
        );
    }

    findByDateRange(surveyId: number, start: Date, end: Date): Promise<SurveyResponse[]> {
        return executeRequest(
            this.http.get<SurveyResponse[]>(`${this.BACKEND}/surveys/${surveyId}/responses`, {
                ...httpHeaders(),
                params: { start: start.getTime(), end: end.getTime() }
            }),
            10_000
        );
    }
}
