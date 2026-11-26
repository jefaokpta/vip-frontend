/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {executeRequest, httpHeaders} from '@/util/utils';
import {Cdr} from '@/pabx/types/cdr';
import {CdrDetail} from '@/pabx/types/cdr-detail';

@Injectable({ providedIn: 'root' })
export class ReportService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    /** Todas as chamadas do dia atual (00:00 até 23:59:59.999, horário local). */
    findToday(): Promise<Cdr[]> {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return this.findByDateRange(start, end);
    }

    /** Chamadas feitas e recebidas pelo usuário logado nos últimos 30 dias. */
    findMine(): Promise<Cdr[]> {
        return executeRequest(this.http.get<Cdr[]>(`${this.BACKEND}/cdrs/mine`, httpHeaders()), 10_000);
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

    findById(id: number): Promise<CdrDetail> {
        return executeRequest(this.http.get<CdrDetail>(`${this.BACKEND}/cdrs/${id}`, httpHeaders()), 10_000);
    }
}
