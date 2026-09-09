import {Routes} from '@angular/router';
import {UsersPage} from '@/pages/users/users';
import {NewUserPage} from '@/pages/users/new-user';
import {EditUserPage} from '@/pages/users/edit-user';

export default [
    { path: '', component: UsersPage, data: { breadcrumb: 'Usuários' } },
    { path: 'new', component: NewUserPage, data: { breadcrumb: 'Usuários / Novo' } },
    { path: 'edit/:id', component: EditUserPage, data: { breadcrumb: 'Usuários / Editar' } }
] as Routes;
