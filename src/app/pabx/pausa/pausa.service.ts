import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {executeRequest, httpHeaders} from '@/util/utils';
import {Pausa} from '@/pabx/types/pausa';

@Injectable({providedIn: 'root'})
export class PausaService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {
    }

    findAll(): Promise<Pausa[]> {
        return executeRequest(this.http.get<Pausa[]>(`${this.BACKEND}/pausas`, httpHeaders()));
    }

    findById(id: number): Promise<Pausa> {
        return executeRequest(this.http.get<Pausa>(`${this.BACKEND}/pausas/${id}`, httpHeaders()));
    }

    create(pausa: Pausa) {
        return executeRequest(this.http.post(`${this.BACKEND}/pausas`, pausa, httpHeaders()));
    }

    update(pausa: Pausa) {
        return executeRequest(this.http.put(`${this.BACKEND}/pausas/${pausa.id}`, pausa, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/pausas/${id}`, httpHeaders()));
    }
}
