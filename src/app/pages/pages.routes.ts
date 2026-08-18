import { Routes } from '@angular/router';
import { UsersPage } from '@/pages/users/users';
import { NewUserPage } from '@/pages/users/new-user';
import { CompanyPage } from '@/pages/company/company.page';
import { NewCompanyPage } from '@/pages/company/new-company.page';
import { PersonPage } from '@/pages/person.page';
import { EditCompanyPage } from '@/pages/company/edit-company.page';
import { EditUserPage } from '@/pages/users/edit-user';
import { QueueDashboard } from '@/pages/dashboard/queue.dashboard';
import { QueueLoginPage } from '@/pages/queues/queue-login';
import { TenantPage } from '@/pages/tenant/tenant.page';
import { NewTenantPage } from '@/pages/tenant/new-tenant.page';
import { EditTenantPage } from '@/pages/tenant/edit-tenant.page';

export default [
    { path: 'companies', component: CompanyPage, data: { breadcrumb: 'Empresas' } },
    { path: 'companies/new', component: NewCompanyPage, data: { breadcrumb: 'Empresas / Nova' } },
    { path: 'companies/edit/:id', component: EditCompanyPage, data: { breadcrumb: 'Empresas / Editar' } },
    { path: 'tenants', component: TenantPage, data: { breadcrumb: 'Tenants' } },
    { path: 'tenants/new', component: NewTenantPage, data: { breadcrumb: 'Tenants / Novo' } },
    { path: 'tenants/edit/:id', component: EditTenantPage, data: { breadcrumb: 'Tenants / Editar' } },
    { path: 'users', component: UsersPage, data: { breadcrumb: 'Usuários' } },
    { path: 'users/new', component: NewUserPage, data: { breadcrumb: 'Usuários / Novo' } },
    { path: 'users/edit/:id', component: EditUserPage, data: { breadcrumb: 'Usuários / Editar' } },
    { path: 'profile', component: PersonPage, data: { breadcrumb: 'Perfil' } },
    { path: 'queues', component: QueueDashboard, data: { breadcrumb: 'Painel de Filas' } },
    { path: 'queue-login', component: QueueLoginPage, data: { breadcrumb: 'Minhas Filas' } },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
