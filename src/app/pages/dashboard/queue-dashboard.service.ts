/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/22/25
 */

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { executeRequest, httpHeaders } from '@/util/utils';
import { QueueState } from '@/pabx/types';

@Injectable({
    providedIn: 'root'
})
export class QueueDashboardService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAllQueueStates(): Promise<QueueState[]> {
        return executeRequest(this.http.get<QueueState[]>(`${this.BACKEND}/queues/states`, httpHeaders()));
    }
}
