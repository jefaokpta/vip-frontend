import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TranscriptionService} from '@/pabx/report/transcription.service';
import {environment} from '../../../environments/environment';

describe('TranscriptionService', () => {
    let service: TranscriptionService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        localStorage.setItem('token', 'jwt-teste');
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TranscriptionService]
        });
        service = TestBed.inject(TranscriptionService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.removeItem('token');
    });

    it('findByCdr busca as transcricoes no vip-ia com o token atual', async () => {
        const promise = service.findByCdr('123.4');

        const req = httpMock.expectOne(`${environment.IA_BACKEND_URL}/transcriptions/by-cdr/123.4`);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-teste');
        req.flush([]);

        expect(await promise).toEqual([]);
    });

    it('findByCdr codifica o uniqueId na url', async () => {
        const promise = service.findByCdr('a/b');

        const req = httpMock.expectOne(`${environment.IA_BACKEND_URL}/transcriptions/by-cdr/a%2Fb`);
        req.flush([]);

        expect(await promise).toEqual([]);
    });
});
