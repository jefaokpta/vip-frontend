import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Moh } from '@/pabx/types/moh';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MohService {
    private readonly BACKEND = environment.API_BACKEND_URL;
    private cachedFindAllPromise: Promise<Moh[]> | null = null;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Moh[]> {
        if (this.cachedFindAllPromise) {
            return this.cachedFindAllPromise;
        }
        this.cachedFindAllPromise = executeRequest(this.http.get<Moh[]>(`${this.BACKEND}/mohs`, httpHeaders()));
        return this.cachedFindAllPromise;
    }

    findById(id: string): Promise<Moh> {
        return executeRequest(this.http.get<Moh>(`${this.BACKEND}/mohs/${id}`, httpHeaders()));
    }

    async create(name: string, file: File): Promise<Moh> {
        const body = { name, fileName: file.name, contentType: file.type || 'audio/mpeg', fileSize: file.size };
        const { moh, uploadUrl } = await executeRequest(
            this.http.post<{ moh: Moh; uploadUrl: string }>(`${this.BACKEND}/mohs`, body, httpHeaders())
        );
        await firstValueFrom(
            this.http.put(uploadUrl, file, { headers: new HttpHeaders({ 'Content-Type': file.type || 'audio/mpeg' }) })
        );
        this.cachedFindAllPromise = null;
        return moh;
    }

    update(id: number, name: string): Promise<Moh> {
        const formData = new FormData();
        formData.append('name', name);
        const result = executeRequest(this.http.put<Moh>(`${this.BACKEND}/mohs/${id}`, formData, httpHeaders()));
        this.cachedFindAllPromise = null;
        return result;
    }

    delete(id: number) {
        const result = executeRequest(this.http.delete(`${this.BACKEND}/mohs/${id}`, httpHeaders()));
        this.cachedFindAllPromise = null;
        return result;
    }
}
