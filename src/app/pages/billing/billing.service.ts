import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import {
    BillingMode,
    BillingRunDetail,
    BillingRunList,
    BillingRunSummary,
    CompanyBilling,
    CompanyBillingDTO,
    OmieConfig
} from '@/pages/billing/types';

@Injectable({
    providedIn: 'root'
})
export class BillingService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    getCompanyBilling(companyId: string): Promise<CompanyBilling> {
        return executeRequest(
            this.http.get<CompanyBilling>(`${this.BACKEND}/billing/companies/${companyId}`, httpHeaders())
        );
    }

    saveCompanyBilling(companyId: string, dto: CompanyBillingDTO): Promise<CompanyBilling> {
        return executeRequest(
            this.http.put<CompanyBilling>(`${this.BACKEND}/billing/companies/${companyId}`, dto, httpHeaders())
        );
    }

    getOmieConfig(): Promise<OmieConfig> {
        return executeRequest(this.http.get<OmieConfig>(`${this.BACKEND}/billing/omie-config`, httpHeaders()));
    }

    saveOmieConfig(dto: OmieConfig): Promise<OmieConfig> {
        return executeRequest(this.http.put<OmieConfig>(`${this.BACKEND}/billing/omie-config`, dto, httpHeaders()));
    }

    listRuns(): Promise<BillingRunList> {
        return executeRequest(this.http.get<BillingRunList>(`${this.BACKEND}/billing/runs`, httpHeaders()));
    }

    getRun(id: number): Promise<BillingRunDetail> {
        return executeRequest(this.http.get<BillingRunDetail>(`${this.BACKEND}/billing/runs/${id}`, httpHeaders()));
    }

    startRun(mode: BillingMode): Promise<BillingRunSummary> {
        return executeRequest(
            this.http.post<BillingRunSummary>(`${this.BACKEND}/billing/runs`, { mode }, httpHeaders())
        );
    }

    resume(id: number): Promise<BillingRunSummary> {
        return executeRequest(
            this.http.post<BillingRunSummary>(`${this.BACKEND}/billing/runs/${id}/resume`, {}, httpHeaders())
        );
    }

    cancel(id: number): Promise<BillingRunSummary> {
        return executeRequest(
            this.http.post<BillingRunSummary>(`${this.BACKEND}/billing/runs/${id}/cancel`, {}, httpHeaders())
        );
    }

    rerun(id: number, companyId: string): Promise<unknown> {
        return executeRequest(
            this.http.post(`${this.BACKEND}/billing/runs/${id}/clients/${companyId}/rerun`, {}, httpHeaders())
        );
    }
}
