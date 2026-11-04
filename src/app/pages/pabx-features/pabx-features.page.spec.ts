import {TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {signal} from '@angular/core';
import {PabxFeaturesPage} from './pabx-features.page';
import {AppProfileSidebar} from '@/layout/components/app.profilesidebar';
import {LayoutService} from '@/layout/service/layout.service';
import {UserService} from '@/pages/users/user.service';
import pagesRoutes from '@/pages/pages.routes';

describe('Facilidades do PABX', () => {
    function pageText(): string {
        const fixture = TestBed.createComponent(PabxFeaturesPage);
        fixture.detectChanges();
        return fixture.nativeElement.textContent;
    }

    it('explica cada código existente no PABX', () => {
        const text = pageText();
        ['Transferência cega', 'Transferência assistida', 'Estacionar', 'Resgatar', 'Capturar'].forEach((name) =>
            expect(text).toContain(name)
        );
        ['*1', '*2', '*7', '*7 + ramal', '*8', '*8 + ramal'].forEach((code) => expect(text).toContain(code));
    });

    it('avisa o limite real de estacionamento', () => {
        expect(pageText()).toContain('60 segundos');
    });

    it('tem rota em /pages/pabx-features', () => {
        expect(pagesRoutes.find((route) => route.path === 'pabx-features')?.component).toBe(PabxFeaturesPage);
    });

    it('aparece no menu logo abaixo de Suporte', () => {
        TestBed.configureTestingModule({
            providers: [
                provideNoopAnimations(),
                provideRouter([]),
                { provide: LayoutService, useValue: { layoutState: signal({ profileSidebarVisible: true }) } },
                { provide: UserService, useValue: { getUserSignal: () => signal({ name: 'Teste' }) } }
            ]
        });
        const fixture = TestBed.createComponent(AppProfileSidebar);
        fixture.detectChanges();
        const items: string[] = Array.from(document.querySelectorAll('.layout-profile-sidebar li, p-drawer li')).map(
            (item) => item.textContent ?? ''
        );
        const support = items.findIndex((item) => item.includes('Suporte'));
        expect(support).toBeGreaterThanOrEqual(0);
        expect(items[support + 1]).toContain('Facilidades do PABX');
        const link = document.querySelector('a[href="/pages/pabx-features"]');
        expect(link).not.toBeNull();
        fixture.destroy();
    });
});
