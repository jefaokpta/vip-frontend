import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { DialPlan } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class DialPlanService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<DialPlan[]> {
        return executeRequest(this.http.get<DialPlan[]>(`${this.BACKEND}/dialplans`, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/dialplans/${id}`, httpHeaders()));
    }

    create(dialplan: DialPlan) {
        return executeRequest(this.http.post(`${this.BACKEND}/dialplans`, dialplan, httpHeaders()));
    }

    findById(id: string) {
        return executeRequest(this.http.get<DialPlan>(`${this.BACKEND}/dialplans/${id}`, httpHeaders()));
    }

    update(dialplan: DialPlan) {
        return executeRequest(this.http.put(`${this.BACKEND}/dialplans/${dialplan.id}`, dialplan, httpHeaders()));
    }
}
