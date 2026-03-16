import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { CompanySettings } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class CompanySettingsService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    get(): Promise<CompanySettings> {
        return executeRequest(this.http.get<CompanySettings>(`${this.BACKEND}/company-settings`, httpHeaders()));
    }

    update(defaultMohId: number | null): Promise<CompanySettings> {
        return executeRequest(
            this.http.put<CompanySettings>(`${this.BACKEND}/company-settings`, { defaultMohId }, httpHeaders())
        );
    }
}
