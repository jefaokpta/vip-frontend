import {Routes} from '@angular/router';
import {PersonPage} from '@/pages/person.page';
import {PeerDashboard} from '@/pages/dashboard/peer.dashboard';
import {QueueDashboard} from '@/pages/dashboard/queue.dashboard';
import {WorkersDashboard} from '@/pages/dashboard/workers.dashboard';
import {QueueLoginPage} from '@/pages/queues/queue-login';
import {moduleGuard} from '@/security/module-guard';
import {roleGuard} from '@/security/role-guard';
import {ModuleEnum} from '@/types/module-enum';
import {RoleEnum} from '@/types/role-enum';

export default [
    { path: 'companies', loadChildren: () => import('@/pages/company/company.routes') },
    { path: 'tenants', loadChildren: () => import('@/pages/tenant/tenant.routes') },
    { path: 'users', loadChildren: () => import('@/pages/users/users.routes') },
    { path: 'profile', component: PersonPage, data: { breadcrumb: 'Perfil' } },
    { path: 'peers', component: PeerDashboard, canActivate: [moduleGuard(ModuleEnum.PABX)], data: { breadcrumb: 'Painel de Ramais' } },
    { path: 'queues', component: QueueDashboard, canActivate: [moduleGuard(ModuleEnum.PABX), roleGuard(RoleEnum.ROLE_COMPANY_SUPERVISOR)], data: { breadcrumb: 'Painel de Filas' } },
    { path: 'queue-login', component: QueueLoginPage, data: { breadcrumb: 'Minhas Filas' } },
    { path: 'workers', component: WorkersDashboard, data: { breadcrumb: 'Painel de Workers' } },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
