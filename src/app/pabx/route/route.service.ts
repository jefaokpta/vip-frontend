import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Route } from '@/pabx/types';
import { UserService } from '@/pages/users/user.service';

@Injectable({ providedIn: 'root' })
export class RouteService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(
        private readonly http: HttpClient,
        private readonly userService: UserService
    ) {}

    findAll(): Promise<Route[]> {
        const user = this.userService.getUser();
        return executeRequest(this.http.get<Route[]>(`${this.BACKEND}/routes/${user.controlNumber}`, httpHeaders()));
    }

    delete(id: number) {
        const user = this.userService.getUser();
        return executeRequest(this.http.delete(`${this.BACKEND}/routes/${user.controlNumber}/${id}`, httpHeaders()));
    }

    create(trunk: Route) {
        const user = this.userService.getUser();
        return executeRequest(this.http.post(`${this.BACKEND}/routes/${user.controlNumber}`, trunk, httpHeaders()));
    }

    findById(id: string) {
        const user = this.userService.getUser();
        return executeRequest(
            this.http.get<Route>(`${this.BACKEND}/routes/${user.controlNumber}/${id}`, httpHeaders())
        );
    }

    update(route: Route) {
        const user = this.userService.getUser();
        return executeRequest(
            this.http.put(`${this.BACKEND}/trunks/${user.controlNumber}/${route.id}`, route, httpHeaders())
        );
    }
}
