import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/components/app.layout';
import { Notfound } from '@/pages/notfound';
import { authGuard } from '@/security/auth-guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('@/pages/dashboard/dashboard').then((c) => c.Dashboard),
                data: { breadcrumb: 'Dashboard' }
            },
            {
                path: 'pages',
                loadChildren: () => import('@/pages/pages.routes')
            },
            {
                path: 'pabx',
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
