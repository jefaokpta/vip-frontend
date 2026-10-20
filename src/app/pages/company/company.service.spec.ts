import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {CompanyService} from '@/pages/company/company.service';
import {ServiceEnum} from '@/types/service-enum';
import {environment} from '../../../environments/environment';

describe('CompanyService', () => {
    let service: CompanyService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(CompanyService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('updateServices faz PUT /companies/{companyId}/services com os serviços', async () => {
        const promise = service.updateServices('100054', [ServiceEnum.PABX, ServiceEnum.IA]);
        const req = http.expectOne(`${environment.API_BACKEND_URL}/companies/100054/services`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({ services: ['PABX', 'IA'] });
        req.flush({ companyId: '100054', services: ['PABX', 'IA'] });
        expect((await promise).services).toEqual([ServiceEnum.PABX, ServiceEnum.IA]);
    });
});
