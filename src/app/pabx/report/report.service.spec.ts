import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {ReportService} from '@/pabx/report/report.service';
import {environment} from '../../../environments/environment';
import {CdrDetail} from '@/pabx/types/cdr-detail';

describe('ReportService', () => {
    let service: ReportService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ReportService]
        });
        service = TestBed.inject(ReportService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('findById busca o detalhe da chamada por id', async () => {
        const cdrDetail: CdrDetail = {
            id: 42,
            peer: '12',
            src: '12_100023',
            destination: '1132931515',
            callerId: 'teste',
            duration: 40,
            billableSeconds: 40,
            uniqueId: 'unique-1',
            disposition: 'ANSWERED',
            startTime: new Date(),
            channel: 'PJSIP/WORKER1-1',
            userfield: 'OUTBOUND' as CdrDetail['userfield'],
            destinationChannel: 'PJSIP/JPBX-1',
            accountCode: '1.00',
            cost: 1.0,
            interactions: []
        };

        const promise = service.findById(42);

        const req = httpMock.expectOne(`${environment.API_BACKEND_URL}/cdrs/42`);
        expect(req.request.method).toBe('GET');
        req.flush(cdrDetail);

        expect(await promise).toEqual(cdrDetail);
    });
});
