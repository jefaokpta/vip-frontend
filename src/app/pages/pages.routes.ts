import {Routes} from '@angular/router';
import {UsersPage} from '@/pages/users/users';
import {NewUserPage} from '@/pages/users/new-user';
import {EditUserPage} from '@/pages/users/edit-user';
import {CompanyPage} from '@/pages/company/company.page';
import {NewCompanyPage} from '@/pages/company/new-company.page';
import {EditCompanyPage} from '@/pages/company/edit-company.page';
import {PersonPage} from '@/pages/person.page';
import {PeerPage} from "@/pages/pabx/peer/peer.page";
import {DialplanPage} from "@/pages/pabx/dialplan/dialplan.page";
import {AliasPage} from "@/pages/pabx/alias/alias.page";
import {NewAliasPage} from "@/pages/pabx/alias/new-alias.page";

export default [
    {path: 'companies', component: CompanyPage, data: {breadcrumb: 'Empresas'}},
    { path: 'companies/new', component: NewCompanyPage, data: { breadcrumb: 'Empresas / Criar' } },
    { path: 'companies/edit/:id', component: EditCompanyPage, data: { breadcrumb: 'Empresas / Editar' } },
    { path: 'users', component: UsersPage, data: { breadcrumb: 'Usuários' } },
    { path: 'users/new', component: NewUserPage, data: { breadcrumb: 'Usuários / Criar' } },
    { path: 'users/edit/:id', component: EditUserPage, data: { breadcrumb: 'Usuários / Editar' } },
    { path: 'profile', component: PersonPage, data: { breadcrumb: 'Perfil' } },
    {path: 'pabx/peers', component: PeerPage, data: {breadcrumb: 'Ramais'}},
    {path: 'pabx/dialplans', component: DialplanPage, data: {breadcrumb: 'Regras de Discagem'}},
    {path: 'pabx/aliases', component: AliasPage, data: {breadcrumb: 'Alias de Discagem'}},
    {path: 'pabx/aliases/new', component: NewAliasPage, data: {breadcrumb: 'Novo Alias de Discagem'}},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
