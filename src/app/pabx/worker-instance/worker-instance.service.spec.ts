import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {WorkerInstanceService} from '@/pabx/worker-instance/worker-instance.service';
import {environment} from '../../../environments/environment';

describe('WorkerInstanceService', () => {
    let service: WorkerInstanceService;
    let http: HttpTestingController;
    const base = `${environment.API_BACKEND_URL}/workers`;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(WorkerInstanceService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('findAll faz GET /workers', async () => {
        const promise = service.findAll();
        const req = http.expectOne(base);
        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, name: 'WORKER1', dns: 'w1', internalIp: '10.0.0.1' }]);
        expect((await promise).length).toBe(1);
    });

    it('create faz POST /workers com o corpo', async () => {
        const body = { name: 'WORKER2', dns: 'w2', internalIp: '10.0.0.2' };
        const promise = service.create(body);
        const req = http.expectOne(base);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(body);
        req.flush({});
        await promise;
    });

    it('update faz PUT e delete faz DELETE em /workers/{id}', async () => {
        const body = { name: 'WORKER2', dns: 'w2', internalIp: '10.0.0.2' };
        const put = service.update(5, body);
        const putReq = http.expectOne(`${base}/5`);
        expect(putReq.request.method).toBe('PUT');
        putReq.flush({});
        await put;

        const del = service.delete(5);
        const delReq = http.expectOne(`${base}/5`);
        expect(delReq.request.method).toBe('DELETE');
        delReq.flush({});
        await del;
    });

    it('updateReady faz PATCH em /workers/{id}/ready/{valor}', async () => {
        const promise = service.updateReady(5, false);
        const req = http.expectOne(`${base}/5/ready/false`);
        expect(req.request.method).toBe('PATCH');
        req.flush({});
        await promise;
    });
});
