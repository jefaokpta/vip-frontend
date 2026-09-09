import {Routes} from '@angular/router';
import {CompanyPage} from '@/pages/company/company.page';
import {NewCompanyPage} from '@/pages/company/new-company.page';
import {EditCompanyPage} from '@/pages/company/edit-company.page';

export default [
    { path: '', component: CompanyPage, data: { breadcrumb: 'Empresas' } },
    { path: 'new', component: NewCompanyPage, data: { breadcrumb: 'Empresas / Nova' } },
    { path: 'edit/:id', component: EditCompanyPage, data: { breadcrumb: 'Empresas / Editar' } }
] as Routes;
