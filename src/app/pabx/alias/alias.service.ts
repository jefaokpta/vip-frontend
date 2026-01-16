import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Alias } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class AliasService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Alias[]> {
        return executeRequest(this.http.get<Alias[]>(`${this.BACKEND}/aliases`, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/aliases/${id}`, httpHeaders()));
    }

    create(alias: Alias) {
        return executeRequest(this.http.post(`${this.BACKEND}/aliases`, alias, httpHeaders()));
    }

    findById(id: number) {
        return executeRequest(this.http.get<Alias>(`${this.BACKEND}/aliases/${id}`, httpHeaders()));
    }

    update(alias: Alias) {
        return executeRequest(this.http.put(`${this.BACKEND}/aliases/${alias.id}`, alias, httpHeaders()));
    }
}
