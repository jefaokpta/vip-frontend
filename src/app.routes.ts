import {Routes} from '@angular/router';
import {AppLayout} from '@/layout/components/app.layout';
import {Notfound} from '@/pages/notfound';
import {authGuard} from '@/security/auth-guard';
import {moduleGuard} from '@/security/module-guard';
import {ModuleEnum} from '@/types/module-enum';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('@/pages/dashboard/my-calls.dashboard').then((c) => c.MyCallsDashboard),
                data: { breadcrumb: 'Minhas Chamadas' }
            },
            {
                path: 'calls/:id',
                loadComponent: () => import('@/pabx/report/report-detail.page').then((c) => c.ReportDetailPage),
                data: { breadcrumb: 'Detalhe da Chamada' }
            },
            {
                path: 'pages',
                loadChildren: () => import('@/pages/pages.routes')
            },
            { path: 'pabx/call-report/detail/:id', redirectTo: '/calls/:id' },
            {
                path: 'pabx',
                canActivate: [moduleGuard(ModuleEnum.PABX)],
                loadChildren: () => import('@/pabx/pabx.routes')
            }
        ]
    },
    { path: 'notfound', component: Notfound },
    {
        path: 'auth',
        loadChildren: () => import('@/auth/auth.routes')
    },
    { path: '**', redirectTo: '/notfound' }
];
