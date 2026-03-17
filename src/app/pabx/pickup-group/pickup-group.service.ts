import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { PickupGroup } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class PickupGroupService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<PickupGroup[]> {
        return executeRequest(this.http.get<PickupGroup[]>(`${this.BACKEND}/pickup-groups`, httpHeaders()));
    }

    findById(id: string): Promise<PickupGroup> {
        return executeRequest(this.http.get<PickupGroup>(`${this.BACKEND}/pickup-groups/${id}`, httpHeaders()));
    }

    create(name: string): Promise<PickupGroup> {
        return executeRequest(this.http.post<PickupGroup>(`${this.BACKEND}/pickup-groups`, { name }, httpHeaders()));
    }

    update(id: number, name: string): Promise<PickupGroup> {
        return executeRequest(
            this.http.put<PickupGroup>(`${this.BACKEND}/pickup-groups/${id}`, { name }, httpHeaders())
        );
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/pickup-groups/${id}`, httpHeaders()));
    }
}
