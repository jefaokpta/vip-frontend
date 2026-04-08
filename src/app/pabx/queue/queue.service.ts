import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Queue } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class QueueService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Queue[]> {
        return executeRequest(this.http.get<Queue[]>(`${this.BACKEND}/queues`, httpHeaders()));
    }

    findById(id: string): Promise<Queue> {
        return executeRequest(this.http.get<Queue>(`${this.BACKEND}/queues/${id}`, httpHeaders()));
    }

    create(body: object): Promise<Queue> {
        return executeRequest(this.http.post<Queue>(`${this.BACKEND}/queues`, body, httpHeaders()));
    }

    update(id: number, body: object): Promise<Queue> {
        return executeRequest(this.http.put<Queue>(`${this.BACKEND}/queues/${id}`, body, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/queues/${id}`, httpHeaders()));
    }
}
