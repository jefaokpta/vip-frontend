import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { executeRequest, httpHeaders } from '@/util/utils';
import { WorkersOverview } from '@/pabx/types/workers-overview';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WorkersDashboardService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    getOverview(): Promise<WorkersOverview> {
        return executeRequest(
            this.http.get<WorkersOverview>(`${this.BACKEND}/callstates/workers/overview`, httpHeaders())
        );
    }
}
