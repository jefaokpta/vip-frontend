import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BillingService } from '@/pages/billing/billing.service';
import { environment } from '../../../environments/environment';

describe('BillingService', () => {
    let service: BillingService;
    let http: HttpTestingController;
    const base = `${environment.API_BACKEND_URL}/billing`;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(BillingService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    async function check(call: Promise<unknown>, url: string, method: string, body?: unknown) {
        const req = http.expectOne(url);
        expect(req.request.method).toBe(method);
        if (body !== undefined) expect(req.request.body).toEqual(body);
        req.flush({});
        await call;
    }

    const dto = {
        franchiseType: 'MINUTOS' as const,
        franchiseValue: 100,
        franchiseMinutes: 500,
        exceedingMinuteRate: 0.1,
        franchise0800: 10,
        franchise4000: 5
    };
    const omie = {
        codServicoConsumo: 1,
        codServicoMinutos: 2,
        codServicoInternacional: 3,
        codServico0800: 4,
        codServico4000: 5
    };

    it('getCompanyBilling GET', () => check(service.getCompanyBilling('100054'), `${base}/companies/100054`, 'GET'));
    it('saveCompanyBilling PUT', () =>
        check(service.saveCompanyBilling('100054', dto), `${base}/companies/100054`, 'PUT', dto));
    it('getOmieConfig GET', () => check(service.getOmieConfig(), `${base}/omie-config`, 'GET'));
    it('saveOmieConfig PUT', () => check(service.saveOmieConfig(omie), `${base}/omie-config`, 'PUT', omie));
    it('listRuns GET', () => check(service.listRuns(), `${base}/runs`, 'GET'));
    it('getRun GET', () => check(service.getRun(7), `${base}/runs/7`, 'GET'));
    it('startRun POST com mode', () =>
        check(service.startRun('SIMULACAO'), `${base}/runs`, 'POST', { mode: 'SIMULACAO' }));
    it('resume POST', () => check(service.resume(7), `${base}/runs/7/resume`, 'POST'));
    it('cancel POST', () => check(service.cancel(7), `${base}/runs/7/cancel`, 'POST'));
    it('rerun POST', () => check(service.rerun(7, '100054'), `${base}/runs/7/clients/100054/rerun`, 'POST'));
});
