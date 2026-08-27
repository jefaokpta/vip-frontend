import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { MemberActivityReportResponse, QueueOption } from '@/pabx/types/member-activity';

@Injectable({ providedIn: 'root' })
export class MemberActivityReportService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findQueues(): Promise<QueueOption[]> {
        return executeRequest(
            this.http.get<QueueOption[]>(`${this.BACKEND}/member-activity-report/queues`, httpHeaders()),
            10_000
        );
    }

    findReport(queueId: number, start: Date, end: Date): Promise<MemberActivityReportResponse> {
        return executeRequest(
            this.http.get<MemberActivityReportResponse>(`${this.BACKEND}/member-activity-report/${queueId}`, {
                ...httpHeaders(),
                params: { start: start.getTime(), end: end.getTime() }
            }),
            10_000
        );
    }
}
