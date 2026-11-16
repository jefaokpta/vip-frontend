import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PeerActionComponent } from '@/pabx/dialplan/components/peer-action.component';
import { PeerService } from '@/pabx/peer/peer.service';

describe('PeerActionComponent - tempo de toque', () => {
    let fixture: ComponentFixture<PeerActionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PeerActionComponent],
            providers: [
                provideNoopAnimations(),
                {
                    provide: PeerService,
                    useValue: { findAll: () => Promise.resolve([]), findAvailable: () => Promise.resolve([]) }
                }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(PeerActionComponent);
        fixture.detectChanges();
    });

    it('padrão é 30s', () => {
        expect(fixture.componentInstance.timeout).toBe('30');
    });

    it('mostra o rótulo do campo', () => {
        expect(fixture.nativeElement.textContent).toContain('Tempo de toque (segundos)');
    });

    it('alterar o tempo emite timeoutChange como texto', () => {
        const emitted: string[] = [];
        fixture.componentInstance.timeoutChange.subscribe((v: string) => emitted.push(v));

        fixture.componentInstance.onTimeoutChange(45);

        expect(emitted).toEqual(['45']);
    });
});

describe('PeerActionComponent - erro de tempo de toque', () => {
    it('mostra a mensagem quando timeoutError é verdadeiro', async () => {
        await TestBed.configureTestingModule({
            imports: [PeerActionComponent],
            providers: [
                provideNoopAnimations(),
                {
                    provide: PeerService,
                    useValue: { findAll: () => Promise.resolve([]), findAvailable: () => Promise.resolve([]) }
                }
            ]
        }).compileComponents();
        const fixture = TestBed.createComponent(PeerActionComponent);
        fixture.componentRef.setInput('timeoutError', true);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Informe entre 5 e 300 segundos.');
    });
});
