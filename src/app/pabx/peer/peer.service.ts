import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Peer } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class PeerService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Peer[]> {
        return executeRequest(this.http.get<Peer[]>(`${this.BACKEND}/peers`, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/peers/${id}`, httpHeaders()));
    }

    create(peer: Peer) {
        return executeRequest(this.http.post(`${this.BACKEND}/peers`, peer, httpHeaders()));
    }

    findById(id: string) {
        return executeRequest(this.http.get<Peer>(`${this.BACKEND}/peers/${id}`, httpHeaders()));
    }

    update(peer: Peer) {
        return executeRequest(this.http.put(`${this.BACKEND}/peers/${peer.id}`, peer, httpHeaders()));
    }
}
