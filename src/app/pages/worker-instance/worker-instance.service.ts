import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { NewWorkerInstance, WorkerInstance } from '@/types/worker-instance';

@Injectable({ providedIn: 'root' })
export class WorkerInstanceService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<WorkerInstance[]> {
        return executeRequest(this.http.get<WorkerInstance[]>(`${this.BACKEND}/workers`, httpHeaders()));
    }

    findById(id: number): Promise<WorkerInstance> {
        return executeRequest(this.http.get<WorkerInstance>(`${this.BACKEND}/workers/${id}`, httpHeaders()));
    }

    create(worker: NewWorkerInstance) {
        return executeRequest(this.http.post(`${this.BACKEND}/workers`, worker, httpHeaders()));
    }

    update(id: number, worker: NewWorkerInstance) {
        return executeRequest(this.http.put(`${this.BACKEND}/workers/${id}`, worker, httpHeaders()));
    }

    updateReady(id: number, ready: boolean) {
        return executeRequest(this.http.patch(`${this.BACKEND}/workers/${id}/ready/${ready}`, null, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/workers/${id}`, httpHeaders()));
    }
}
