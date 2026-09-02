import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {executeRequest, httpHeaders} from '@/util/utils';
import {Pause} from '@/pabx/types/pause';

@Injectable({ providedIn: 'root' })
export class PauseService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Pause[]> {
        return executeRequest(this.http.get<Pause[]>(`${this.BACKEND}/pauses`, httpHeaders()));
    }

    findById(id: number): Promise<Pause> {
        return executeRequest(this.http.get<Pause>(`${this.BACKEND}/pauses/${id}`, httpHeaders()));
    }

    create(pause: Pause) {
        return executeRequest(this.http.post(`${this.BACKEND}/pauses`, pause, httpHeaders()));
    }

    update(pause: Pause) {
        return executeRequest(this.http.put(`${this.BACKEND}/pauses/${pause.id}`, pause, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/pauses/${id}`, httpHeaders()));
    }
}
