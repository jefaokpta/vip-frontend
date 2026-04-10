import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueueState } from '@/pabx/types';
import { executeRequest, httpHeaders } from '@/util/utils';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class QueueLoginService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    getMyQueues(): Promise<QueueState[]> {
        return executeRequest(this.http.get<QueueState[]>(`${this.BACKEND}/queues/states/my`, httpHeaders()));
    }

    login(queueId: number): Promise<void> {
        return executeRequest(
            this.http.post<void>(`${this.BACKEND}/queues/states/${queueId}/login`, {}, httpHeaders())
        );
    }

    logout(queueId: number): Promise<void> {
        return executeRequest(this.http.delete<void>(`${this.BACKEND}/queues/states/${queueId}/logout`, httpHeaders()));
    }

    pause(queueId: number): Promise<void> {
        return executeRequest(
            this.http.post<void>(`${this.BACKEND}/queues/states/${queueId}/pause`, {}, httpHeaders())
        );
    }

    unpause(queueId: number): Promise<void> {
        return executeRequest(this.http.delete<void>(`${this.BACKEND}/queues/states/${queueId}/pause`, httpHeaders()));
    }
}
