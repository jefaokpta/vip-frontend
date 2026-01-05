import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Trunk } from '@/pabx/types';
import { UserService } from '@/pages/users/user.service';

@Injectable({ providedIn: 'root' })
export class TrunkService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(
        private readonly http: HttpClient,
        private readonly userService: UserService
    ) {}

    findAll(): Promise<Trunk[]> {
        const user = this.userService.getUser();
        return executeRequest(this.http.get<Trunk[]>(`${this.BACKEND}/trunks/${user.controlNumber}`, httpHeaders()));
    }

    delete(id: number) {
        const user = this.userService.getUser();
        return executeRequest(this.http.delete(`${this.BACKEND}/trunks/${user.controlNumber}/${id}`, httpHeaders()));
    }

    create(trunk: Trunk) {
        const user = this.userService.getUser();
        return executeRequest(this.http.post(`${this.BACKEND}/trunks/${user.controlNumber}`, trunk, httpHeaders()));
    }

    findById(id: number) {
        const user = this.userService.getUser();
        return executeRequest(
            this.http.get<Trunk>(`${this.BACKEND}/trunks/${user.controlNumber}/${id}`, httpHeaders())
        );
    }

    update(trunk: Trunk) {
        const user = this.userService.getUser();
        return executeRequest(
            this.http.put(`${this.BACKEND}/trunks/${user.controlNumber}/${trunk.id}`, trunk, httpHeaders())
        );
    }
}
