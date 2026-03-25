/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/22/25
 */

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { executeRequest, httpHeaders } from '@/util/utils';
import { CallState, PeerRegistry } from '@/pabx/types';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findPeerRegistries(): Promise<PeerRegistry[]> {
        return executeRequest(this.http.get<PeerRegistry[]>(`${this.BACKEND}/peerregistries`, httpHeaders()));
    }

    findCallStates(): Promise<CallState[]> {
        return executeRequest(this.http.get<CallState[]>(`${this.BACKEND}/callstates`, httpHeaders()));
    }
}
