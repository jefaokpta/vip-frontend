import { Routes } from '@angular/router';
import { RegisterInstancePage } from '@/pages/register-instance/register-instance.page';
import { RegisterInstanceFormPage } from '@/pages/register-instance/register-instance-form.page';

export default [
    { path: '', component: RegisterInstancePage, data: { breadcrumb: 'Registers' } },
    { path: 'new', component: RegisterInstanceFormPage, data: { breadcrumb: 'Registers / Novo' } },
    { path: 'edit/:id', component: RegisterInstanceFormPage, data: { breadcrumb: 'Registers / Editar' } }
] as Routes;
