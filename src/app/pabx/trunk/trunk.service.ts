import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Trunk } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class TrunkService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Trunk[]> {
        return executeRequest(this.http.get<Trunk[]>(`${this.BACKEND}/trunks`, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/trunks/${id}`, httpHeaders()));
    }

    create(trunk: Trunk) {
        return executeRequest(this.http.post(`${this.BACKEND}/trunks`, trunk, httpHeaders()));
    }

    findById(id: string) {
        return executeRequest(this.http.get<Trunk>(`${this.BACKEND}/trunks/${id}`, httpHeaders()));
    }

    update(trunk: Trunk) {
        return executeRequest(this.http.put(`${this.BACKEND}/trunks/${trunk.id}`, trunk, httpHeaders()));
    }
}
