import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { NewTenant, Tenant } from '@/types/tenant';

@Injectable({ providedIn: 'root' })
export class TenantService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Tenant[]> {
        return executeRequest(this.http.get<Tenant[]>(`${this.BACKEND}/tenants`, httpHeaders()));
    }

    findById(id: number): Promise<Tenant> {
        return executeRequest(this.http.get<Tenant>(`${this.BACKEND}/tenants/${id}`, httpHeaders()));
    }

    create(tenant: NewTenant) {
        return executeRequest(this.http.post(`${this.BACKEND}/tenants`, tenant, httpHeaders()));
    }

    update(id: number, tenant: NewTenant) {
        return executeRequest(this.http.put(`${this.BACKEND}/tenants/${id}`, tenant, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/tenants/${id}`, httpHeaders()));
    }
}
