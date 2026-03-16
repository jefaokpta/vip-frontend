import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Moh } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class MohService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Moh[]> {
        return executeRequest(this.http.get<Moh[]>(`${this.BACKEND}/mohs`, httpHeaders()));
    }

    findById(id: string): Promise<Moh> {
        return executeRequest(this.http.get<Moh>(`${this.BACKEND}/mohs/${id}`, httpHeaders()));
    }

    create(name: string, file: File): Promise<Moh> {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('file', file);
        return executeRequest(this.http.post<Moh>(`${this.BACKEND}/mohs`, formData, httpHeaders()), 30_000);
    }

    update(id: number, name: string): Promise<Moh> {
        const formData = new FormData();
        formData.append('name', name);
        return executeRequest(this.http.put<Moh>(`${this.BACKEND}/mohs/${id}`, formData, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/mohs/${id}`, httpHeaders()));
    }
}
