import {Routes} from '@angular/router';
import {TenantPage} from '@/pages/tenant/tenant.page';
import {NewTenantPage} from '@/pages/tenant/new-tenant.page';
import {EditTenantPage} from '@/pages/tenant/edit-tenant.page';

export default [
    { path: '', component: TenantPage, data: { breadcrumb: 'Tenants' } },
    { path: 'new', component: NewTenantPage, data: { breadcrumb: 'Tenants / Novo' } },
    { path: 'edit/:id', component: EditTenantPage, data: { breadcrumb: 'Tenants / Editar' } }
] as Routes;
