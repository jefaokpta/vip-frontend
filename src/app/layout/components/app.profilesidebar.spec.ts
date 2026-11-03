import {TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {signal} from '@angular/core';
import {AppProfileSidebar} from './app.profilesidebar';
import {LayoutService} from '@/layout/service/layout.service';
import {UserService} from '@/pages/users/user.service';

describe('AppProfileSidebar', () => {
    ['/pages/profile', '/pages/queue-login', '/pages/pabx-features'].forEach((path) => {
        it(`fecha o painel ao clicar em ${path}`, () => {
            const layoutState = signal({ profileSidebarVisible: true });
            TestBed.configureTestingModule({
                providers: [
                    provideNoopAnimations(),
                    provideRouter([{ path: '**', children: [] }]),
                    { provide: LayoutService, useValue: { layoutState } },
                    { provide: UserService, useValue: { getUserSignal: () => signal({ name: 'Teste' }) } }
                ]
            });
            const fixture = TestBed.createComponent(AppProfileSidebar);
            fixture.detectChanges();
            (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`a[href="${path}"]`)!.click();
            expect(layoutState().profileSidebarVisible).toBeFalse();
            fixture.destroy();
        });
    });
});
