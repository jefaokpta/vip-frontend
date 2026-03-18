import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { CallGroup } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class CallGroupService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<CallGroup[]> {
        return executeRequest(this.http.get<CallGroup[]>(`${this.BACKEND}/call-groups`, httpHeaders()));
    }

    findById(id: string): Promise<CallGroup> {
        return executeRequest(this.http.get<CallGroup>(`${this.BACKEND}/call-groups/${id}`, httpHeaders()));
    }

    create(body: object): Promise<CallGroup> {
        return executeRequest(this.http.post<CallGroup>(`${this.BACKEND}/call-groups`, body, httpHeaders()));
    }

    update(id: number, body: object): Promise<CallGroup> {
        return executeRequest(this.http.put<CallGroup>(`${this.BACKEND}/call-groups/${id}`, body, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/call-groups/${id}`, httpHeaders()));
    }
}
