import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RegisterInstanceService } from '@/pages/register-instance/register-instance.service';
import { environment } from '../../../environments/environment';

describe('RegisterInstanceService', () => {
    let service: RegisterInstanceService;
    let http: HttpTestingController;
    const base = `${environment.API_BACKEND_URL}/registers`;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(RegisterInstanceService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('findAll faz GET /registers', async () => {
        const promise = service.findAll();
        const req = http.expectOne(base);
        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, name: 'REGISTER1', dns: 'r1', internalIp: '10.0.0.1' }]);
        expect((await promise).length).toBe(1);
    });

    it('create faz POST /registers com o corpo', async () => {
        const body = { name: 'REGISTER2', dns: 'r2', internalIp: '10.0.0.2' };
        const promise = service.create(body);
        const req = http.expectOne(base);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(body);
        req.flush({});
        await promise;
    });

    it('update faz PUT e delete faz DELETE em /registers/{id}', async () => {
        const body = { name: 'REGISTER2', dns: 'r2', internalIp: '10.0.0.2' };
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
});
