import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { DacReportResponse, QueueOption } from '@/pabx/types/dac-report';
import { DacCallsResponse, RecordingUrlResponse } from '@/pabx/types/dac-call-journey';

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

    findCalls(queueId: number, start: number, end: number): Promise<DacCallsResponse> {
        return executeRequest(
            this.http.get<DacCallsResponse>(`${this.BACKEND}/dac-report/${queueId}/calls`, {
                ...httpHeaders(),
                params: { start, end }
            }),
            10_000
        );
    }

    findRecordingUrl(queueId: number, uniqueId: string, memberPeer: string): Promise<string> {
        return executeRequest(
            this.http.get<RecordingUrlResponse>(
                `${this.BACKEND}/dac-report/${queueId}/calls/${uniqueId}/recording-url`,
                { ...httpHeaders(), params: { memberPeer } }
            ),
            10_000
        ).then((response) => response.url);
    }
}
