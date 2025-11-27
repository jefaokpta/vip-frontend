/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/22/25
 */

import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Worker} from '@/types/types';
import {Injectable} from '@angular/core';
import {executeRequest, httpHeaders} from "@/util/utils";
import {Peer} from "@/pabx/types";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {
    }

    findWorkers(): Promise<Worker[]> {
        return executeRequest(this.http.get<Worker[]>(`${this.BACKEND}/workers`, httpHeaders()));
    }

    findPeersByCompany(companyId: string): Promise<Peer[]> {
        return executeRequest(this.http.get<Peer[]>(`${this.BACKEND}/peers/${companyId}`, httpHeaders()));
    }

}
