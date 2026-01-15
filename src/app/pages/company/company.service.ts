import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Company } from '@/types/types';
import { executeRequest, httpHeaders } from '@/util/utils';
import { environment } from '../../../environments/environment';

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

    findAll(): Promise<Company[]> {
        return executeRequest(this.http.get<Company[]>(`${this.BACKEND}/companies`, httpHeaders()));
    }

    create(company: Company) {
        return executeRequest(this.http.post(`${this.BACKEND}/companies`, company, httpHeaders()));
    }
}
