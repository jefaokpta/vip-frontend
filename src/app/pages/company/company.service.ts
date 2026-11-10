import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Company, NewCompany } from '@/types/company';
import { executeRequest, httpHeaders } from '@/util/utils';
import { ServiceEnum } from '@/types/service-enum';
import { environment } from '../../../environments/environment';

// Criação com auto-config e exclusão em cascata podem demorar mais que o timeout padrão
const LONG_TIMEOUT = 60_000;

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findCompanyId(companyId: string): Promise<Company> {
        return executeRequest(this.http.get<Company>(`${this.BACKEND}/companies/${companyId}`, httpHeaders()));
    }

    update(company: Company) {
        return executeRequest(
            this.http.put<Company>(`${this.BACKEND}/companies/${company.companyId}`, company, httpHeaders())
        );
    }

    updateServices(companyId: string, services: ServiceEnum[]): Promise<Company> {
        return executeRequest(
            this.http.put<Company>(`${this.BACKEND}/companies/${companyId}/services`, { services }, httpHeaders())
        );
    }

    findAll(): Promise<Company[]> {
        return executeRequest(this.http.get<Company[]>(`${this.BACKEND}/companies`, httpHeaders()));
    }

    create(company: NewCompany) {
        return executeRequest(this.http.post(`${this.BACKEND}/companies`, company, httpHeaders()), LONG_TIMEOUT);
    }

    delete(companyId: string): Promise<void> {
        return executeRequest(
            this.http.delete<void>(`${this.BACKEND}/companies/${companyId}`, httpHeaders()),
            LONG_TIMEOUT
        );
    }
}
