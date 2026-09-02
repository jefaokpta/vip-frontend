import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { UraSelection } from '@/pabx/types/ura-selection';

@Injectable({ providedIn: 'root' })
export class UraReportService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findLastSelections(uraId: number): Promise<UraSelection[]> {
        return executeRequest(
            this.http.get<UraSelection[]>(`${this.BACKEND}/uras/${uraId}/selections/last`, httpHeaders()),
            10_000
        );
    }

    findByDateRange(uraId: number, start: Date, end: Date): Promise<UraSelection[]> {
        return executeRequest(
            this.http.get<UraSelection[]>(`${this.BACKEND}/uras/${uraId}/selections`, {
                ...httpHeaders(),
                params: { start: start.getTime(), end: end.getTime() }
            }),
            10_000
        );
    }
}
