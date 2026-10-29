import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BlockedIpService } from '@/pages/blocked-ip/blocked-ip.service';
import { BlockedIp } from '@/types/blocked-ip';
import { environment } from '../../../environments/environment';

describe('BlockedIpService', () => {
    let service: BlockedIpService;
    let http: HttpTestingController;
    const url = `${environment.API_BACKEND_URL}/blocked-ips`;
    const blockedIp: BlockedIp = {
        id: 1,
        ip: '10.0.0.1',
        companyId: null,
        origin: 'MANUAL',
        status: 'BLOCKED',
        createdAt: '2026-10-28T10:00:00',
        updatedAt: '2026-10-28T10:00:00'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(BlockedIpService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('findAll faz GET /blocked-ips', async () => {
        const promise = service.findAll();
        const req = http.expectOne(url);
        expect(req.request.method).toBe('GET');
        req.flush([blockedIp]);
        expect(await promise).toEqual([blockedIp]);
    });

    it('create faz POST /blocked-ips com ip e status', async () => {
        const promise = service.create('10.0.0.1', 'ALLOWED');
        const req = http.expectOne(url);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ ip: '10.0.0.1', status: 'ALLOWED' });
        req.flush({ ...blockedIp, status: 'ALLOWED' });
        expect((await promise).status).toBe('ALLOWED');
    });

    it('updateStatus faz PUT /blocked-ips/{id}/status', async () => {
        const promise = service.updateStatus(1, 'ALLOWED');
        const req = http.expectOne(`${url}/1/status`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({ status: 'ALLOWED' });
        req.flush({ ...blockedIp, status: 'ALLOWED' });
        expect((await promise).status).toBe('ALLOWED');
    });

    it('delete faz DELETE /blocked-ips/{id}', async () => {
        const promise = service.delete(1);
        const req = http.expectOne(`${url}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
        await promise;
    });
});
