import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Ddr } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class DdrService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Ddr[]> {
        return executeRequest(this.http.get<Ddr[]>(`${this.BACKEND}/ddrs`, httpHeaders()));
    }

    findById(id: string): Promise<Ddr> {
        return executeRequest(this.http.get<Ddr>(`${this.BACKEND}/ddrs/${id}`, httpHeaders()));
    }

    create(ddr: Ddr) {
        return executeRequest(this.http.post(`${this.BACKEND}/ddrs`, ddr, httpHeaders()));
    }

    update(ddr: Ddr) {
        return executeRequest(this.http.put(`${this.BACKEND}/ddrs/${ddr.id}`, ddr, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/ddrs/${id}`, httpHeaders()));
    }
}
