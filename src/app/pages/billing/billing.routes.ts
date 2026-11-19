import { Routes } from '@angular/router';
import { roleGuard } from '@/security/role-guard';
import { RoleEnum } from '@/types/role-enum';
import { BillingRunsPage } from '@/pages/billing/billing-runs.page';
import { BillingRunDetailPage } from '@/pages/billing/billing-run-detail.page';
import { OmieConfigPage } from '@/pages/billing/omie-config.page';

export default [
    {
        path: '',
        component: BillingRunsPage,
        canActivate: [roleGuard(RoleEnum.ROLE_SAAS_FINANCE)],
        data: { breadcrumb: 'Financeiro' }
    },
    {
        path: 'omie-config',
        component: OmieConfigPage,
        canActivate: [roleGuard(RoleEnum.ROLE_SAAS_FINANCE)],
        data: { breadcrumb: 'Financeiro > Configuração Omie' }
    },
    {
        path: ':id',
        component: BillingRunDetailPage,
        canActivate: [roleGuard(RoleEnum.ROLE_SAAS_FINANCE)],
        data: { breadcrumb: 'Financeiro > Execução' }
    }
] as Routes;
