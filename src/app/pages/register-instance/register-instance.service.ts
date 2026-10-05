import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { NewRegisterInstance, RegisterInstance } from '@/types/register-instance';

@Injectable({ providedIn: 'root' })
export class RegisterInstanceService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<RegisterInstance[]> {
        return executeRequest(this.http.get<RegisterInstance[]>(`${this.BACKEND}/registers`, httpHeaders()));
    }

    findById(id: number): Promise<RegisterInstance> {
        return executeRequest(this.http.get<RegisterInstance>(`${this.BACKEND}/registers/${id}`, httpHeaders()));
    }

    create(register: NewRegisterInstance) {
        return executeRequest(this.http.post(`${this.BACKEND}/registers`, register, httpHeaders()));
    }

    update(id: number, register: NewRegisterInstance) {
        return executeRequest(this.http.put(`${this.BACKEND}/registers/${id}`, register, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/registers/${id}`, httpHeaders()));
    }
}
