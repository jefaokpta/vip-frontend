import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {AppMenuitem} from '@/layout/components/app.menuitem';
import {LayoutService} from '@/layout/service/layout.service';

@Component({ template: '' })
class DummyPage {}

describe('AppMenuitem - estado ativo por rota', () => {
    async function navigateAndCheck(url: string, routerLink: string): Promise<boolean> {
        TestBed.configureTestingModule({
            providers: [provideNoopAnimations(), provideRouter([{ path: '**', component: DummyPage }])]
        });
        await TestBed.inject(Router).navigateByUrl(url);
        const layout = TestBed.inject(LayoutService);
        const spy = spyOn(layout, 'onMenuStateChange');
        const fixture = TestBed.createComponent(AppMenuitem);
        fixture.componentInstance.item = { label: 'x', routerLink: [routerLink] };
        fixture.componentInstance.index = 0;
        fixture.componentInstance.updateActiveStateFromRoute();
        return spy.calls.any();
    }

    it('sub-rota /pabx/peers/new mantém "Ramais" ativo', async () => {
        expect(await navigateAndCheck('/pabx/peers/new', '/pabx/peers')).toBeTrue();
    });

    it('sub-rota /pabx/peers/edit/5 mantém "Ramais" ativo', async () => {
        expect(await navigateAndCheck('/pabx/peers/edit/5', '/pabx/peers')).toBeTrue();
    });

    it('Dashboard "/" não fica ativo em outras rotas', async () => {
        expect(await navigateAndCheck('/pabx/peers', '/')).toBeFalse();
    });

    it('dac-report não fica ativo em dac-report-calls', async () => {
        expect(await navigateAndCheck('/pabx/dac-report-calls', '/pabx/dac-report')).toBeFalse();
    });

    it('opções de match mantêm a mesma referência entre change detections (evita loop no RouterLinkActive)', () => {
        TestBed.configureTestingModule({
            providers: [provideNoopAnimations(), provideRouter([{ path: '**', component: DummyPage }])]
        });
        const fixture = TestBed.createComponent(AppMenuitem);
        fixture.componentInstance.item = { label: 'x', routerLink: ['/pabx/peers'] };
        fixture.componentInstance.index = 0;
        fixture.detectChanges();
        const first = fixture.componentInstance.linkMatchOptions;
        fixture.detectChanges();
        expect(fixture.componentInstance.linkMatchOptions).toBe(first);
        expect(first.paths).toBe('subset');
    });
});
