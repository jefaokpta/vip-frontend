import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BlockedIp, BlockedIpStatus } from '@/types/blocked-ip';
import { executeRequest, httpHeaders } from '@/util/utils';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BlockedIpService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<BlockedIp[]> {
        return executeRequest(this.http.get<BlockedIp[]>(`${this.BACKEND}/blocked-ips`, httpHeaders()));
    }

    create(ip: string, status?: BlockedIpStatus): Promise<BlockedIp> {
        return executeRequest(this.http.post<BlockedIp>(`${this.BACKEND}/blocked-ips`, { ip, status }, httpHeaders()));
    }

    updateStatus(id: number, status: BlockedIpStatus): Promise<BlockedIp> {
        return executeRequest(
            this.http.put<BlockedIp>(`${this.BACKEND}/blocked-ips/${id}/status`, { status }, httpHeaders())
        );
    }

    delete(id: number): Promise<void> {
        return executeRequest(this.http.delete<void>(`${this.BACKEND}/blocked-ips/${id}`, httpHeaders()));
    }
}
