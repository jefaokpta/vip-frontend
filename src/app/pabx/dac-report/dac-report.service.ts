import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { DacReportResponse, QueueOption } from '@/pabx/types/dac-report';

@Injectable({ providedIn: 'root' })
export class DacReportService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findQueues(): Promise<QueueOption[]> {
        return executeRequest(this.http.get<QueueOption[]>(`${this.BACKEND}/dac-report/queues`, httpHeaders()), 10_000);
    }

    findReport(queueId: number, start: Date, end: Date): Promise<DacReportResponse> {
        return executeRequest(
            this.http.get<DacReportResponse>(`${this.BACKEND}/dac-report/${queueId}`, {
                ...httpHeaders(),
                params: { start: start.getTime(), end: end.getTime() }
            }),
            10_000
        );
    }
}
