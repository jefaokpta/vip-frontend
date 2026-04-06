/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Cdr } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class ReportService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findLast30(): Promise<Cdr[]> {
        return executeRequest(this.http.get<Cdr[]>(`${this.BACKEND}/cdrs/last`, httpHeaders()), 10_000);
    }

    findByDateRange(start: Date, end: Date): Promise<Cdr[]> {
        return executeRequest(
            this.http.get<Cdr[]>(`${this.BACKEND}/cdrs`, {
                ...httpHeaders(),
                params: { start: start.getTime(), end: end.getTime() }
            }),
            10_000
        );
    }
}
