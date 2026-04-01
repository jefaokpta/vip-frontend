import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Ura } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class UraService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Ura[]> {
        return executeRequest(this.http.get<Ura[]>(`${this.BACKEND}/uras`, httpHeaders()));
    }

    findById(id: string): Promise<Ura> {
        return executeRequest(this.http.get<Ura>(`${this.BACKEND}/uras/${id}`, httpHeaders()));
    }

    create(ura: Partial<Ura>): Promise<Ura> {
        return executeRequest(this.http.post<Ura>(`${this.BACKEND}/uras`, ura, httpHeaders()));
    }

    update(ura: Ura): Promise<void> {
        return executeRequest(this.http.put<void>(`${this.BACKEND}/uras/${ura.id}`, ura, httpHeaders()));
    }

    delete(id: number): Promise<void> {
        return executeRequest(this.http.delete<void>(`${this.BACKEND}/uras/${id}`, httpHeaders()));
    }
}
