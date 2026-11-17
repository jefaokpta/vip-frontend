import { Routes } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CompanyShellComponent } from '@/pages/company/company-shell.component';
import { CompanyPage } from '@/pages/company/company.page';
import { NewCompanyPage } from '@/pages/company/new-company.page';
import { EditCompanyPage } from '@/pages/company/edit-company.page';

// MessageService no nível da rota: o toast criado na nova empresa sobrevive à navegação para a lista
export default [
    {
        path: '',
        component: CompanyShellComponent,
        providers: [MessageService],
        children: [
            { path: '', component: CompanyPage, data: { breadcrumb: 'Empresas' } },
            { path: 'new', component: NewCompanyPage, data: { breadcrumb: 'Empresas / Nova' } },
            { path: 'edit/:id', component: EditCompanyPage, data: { breadcrumb: 'Empresas / Editar' } }
        ]
    }
] as Routes;
