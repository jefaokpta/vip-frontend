import { Routes } from '@angular/router';
import { WorkerInstancePage } from '@/pages/worker-instance/worker-instance.page';
import { WorkerInstanceFormPage } from '@/pages/worker-instance/worker-instance-form.page';

export default [
    { path: '', component: WorkerInstancePage, data: { breadcrumb: 'Workers' } },
    { path: 'new', component: WorkerInstanceFormPage, data: { breadcrumb: 'Workers / Novo' } },
    { path: 'edit/:id', component: WorkerInstanceFormPage, data: { breadcrumb: 'Workers / Editar' } }
] as Routes;
