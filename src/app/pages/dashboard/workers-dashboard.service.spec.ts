import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WorkersDashboardService } from '@/pages/dashboard/workers-dashboard.service';
import { WorkersOverview } from '@/pabx/types/workers-overview';
import { environment } from '../../../environments/environment';

describe('WorkersDashboardService', () => {
    let service: WorkersDashboardService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [WorkersDashboardService]
        });
        service = TestBed.inject(WorkersDashboardService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('getOverview busca o resumo de canais por worker com o token', async () => {
        localStorage.setItem('token', 'jwt-123');
        const overview: WorkersOverview = {
            totalChannels: 3,
            workers: [{ workerId: 'WORKER1', channels: 3, companies: [{ companyId: '100001', channels: 3 }] }]
        };

        const promise = service.getOverview();

        const req = httpMock.expectOne(`${environment.API_BACKEND_URL}/callstates/workers/overview`);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-123');
        req.flush(overview);

        expect(await promise).toEqual(overview);
    });
});
