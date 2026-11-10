import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MessageService } from 'primeng/api';
import { CompanyShellComponent } from '@/pages/company/company-shell.component';
import { Component } from '@angular/core';
import routes from '@/pages/company/company.routes';

@Component({ selector: 'app-fake-new', standalone: true, template: 'nova' })
class FakeNewPage {}

@Component({ selector: 'app-fake-list', standalone: true, template: 'lista' })
class FakeListPage {}

describe('CompanyShellComponent', () => {
    it('toast emitido antes de navegar para a lista continua visível', async () => {
        TestBed.configureTestingModule({
            providers: [
                provideNoopAnimations(),
                provideRouter([
                    {
                        path: 'companies',
                        component: CompanyShellComponent,
                        providers: [MessageService],
                        children: [
                            { path: '', component: FakeListPage },
                            { path: 'new', component: FakeNewPage }
                        ]
                    }
                ])
            ]
        });
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/companies/new');
        const messages = harness.routeDebugElement!.injector.get(MessageService);
        messages.add({ severity: 'success', summary: 'Empresa criada' });
        await harness.navigateByUrl('/companies');
        harness.fixture.detectChanges();
        await harness.fixture.whenStable();
        harness.detectChanges();
        expect(document.body.textContent).toContain('Empresa criada');
    });

    it('rotas reais: pai sem path usa CompanyShellComponent e provê MessageService', () => {
        const parent = routes.find((r) => r.path === '')!;
        expect(parent.component).toBe(CompanyShellComponent);
        expect(parent.providers).toContain(MessageService);
    });
});
