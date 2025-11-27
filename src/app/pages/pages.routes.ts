import {Routes} from '@angular/router';
import {UsersPage} from '@/pages/users/users';
import {NewUserPage} from '@/pages/users/new-user';
import {EditUserPage} from '@/pages/users/edit-user';
import {CompanyPage} from '@/pages/company/company.page';
import {NewCompanyPage} from '@/pages/company/new-company.page';
import {EditCompanyPage} from '@/pages/company/edit-company.page';
import {PersonPage} from '@/pages/person.page';

export default [
    {path: 'companies', component: CompanyPage, data: {breadcrumb: 'Empresas'}},
    { path: 'companies/new', component: NewCompanyPage, data: { breadcrumb: 'Empresas / Criar' } },
    { path: 'companies/edit/:id', component: EditCompanyPage, data: { breadcrumb: 'Empresas / Editar' } },
    { path: 'users', component: UsersPage, data: { breadcrumb: 'Usuários' } },
    { path: 'users/new', component: NewUserPage, data: { breadcrumb: 'Usuários / Criar' } },
    { path: 'users/edit/:id', component: EditUserPage, data: { breadcrumb: 'Usuários / Editar' } },
    { path: 'profile', component: PersonPage, data: { breadcrumb: 'Perfil' } },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
