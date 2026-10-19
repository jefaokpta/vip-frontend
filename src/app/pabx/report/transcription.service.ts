/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {executeRequest, httpHeaders} from '@/util/utils';
import {Transcription} from '@/types/transcription';

@Injectable({ providedIn: 'root' })
export class TranscriptionService {
    private readonly BACKEND = environment.IA_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findByCdr(uniqueId: string): Promise<Transcription[]> {
        return executeRequest(
            this.http.get<Transcription[]>(`${this.BACKEND}/transcriptions/by-cdr/${encodeURIComponent(uniqueId)}`, httpHeaders()),
            10_000
        );
    }
}
