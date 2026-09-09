import {Routes} from '@angular/router';
import {PersonPage} from '@/pages/person.page';
import {QueueDashboard} from '@/pages/dashboard/queue.dashboard';
import {QueueLoginPage} from '@/pages/queues/queue-login';

export default [
    { path: 'companies', loadChildren: () => import('@/pages/company/company.routes') },
    { path: 'tenants', loadChildren: () => import('@/pages/tenant/tenant.routes') },
    { path: 'users', loadChildren: () => import('@/pages/users/users.routes') },
    { path: 'profile', component: PersonPage, data: { breadcrumb: 'Perfil' } },
    { path: 'queues', component: QueueDashboard, data: { breadcrumb: 'Painel de Filas' } },
    { path: 'queue-login', component: QueueLoginPage, data: { breadcrumb: 'Minhas Filas' } },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
