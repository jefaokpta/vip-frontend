import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Route } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class RouteService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Route[]> {
        return executeRequest(this.http.get<Route[]>(`${this.BACKEND}/routes`, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/routes/${id}`, httpHeaders()));
    }

    create(trunk: Route) {
        return executeRequest(this.http.post(`${this.BACKEND}/routes`, trunk, httpHeaders()));
    }

    findById(id: string) {
        return executeRequest(this.http.get<Route>(`${this.BACKEND}/routes/${id}`, httpHeaders()));
    }

    update(route: Route) {
        return executeRequest(this.http.put(`${this.BACKEND}/routes/${route.id}`, route, httpHeaders()));
    }
}
