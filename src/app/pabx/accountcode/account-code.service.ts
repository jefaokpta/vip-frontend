import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AccountCode } from '@/pabx/types';
import { executeRequest, httpHeaders } from '@/util/utils';

@Injectable({
    providedIn: 'root'
})
export class AccountCodeService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<AccountCode[]> {
        return executeRequest(this.http.get<AccountCode[]>(`${this.BACKEND}/accounts`, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/accounts/${id}`, httpHeaders()));
    }

    create(accountCode: AccountCode) {
        return executeRequest(this.http.post(`${this.BACKEND}/accounts`, accountCode, httpHeaders()));
    }

    findById(id: string): Promise<AccountCode> {
        return executeRequest(this.http.get<AccountCode>(`${this.BACKEND}/accounts/${id}`, httpHeaders()));
    }

    update(accountCode: AccountCode) {
        return executeRequest(this.http.put(`${this.BACKEND}/accounts/${accountCode.id}`, accountCode, httpHeaders()));
    }
}
