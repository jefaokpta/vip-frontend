import { Routes } from '@angular/router';
import { PeerPage } from '@/pabx/peer/peer.page';
import { DialplanPage } from '@/pabx/dialplan/dialplan.page';
import { AliasPage } from '@/pabx/alias/alias.page';
import { NewAliasPage } from '@/pabx/alias/new-alias.page';
import { EditAliasPage } from '@/pabx/alias/edit-alias.page';
import { NewDialplanPage } from '@/pabx/dialplan/new-dialplan/new-dialplan.page';
import { AccountCodePage } from '@/pabx/accountcode/account-code.page';
import { NewAccountCodePage } from '@/pabx/accountcode/new-account-code.page';
import { EditAccountCodePage } from '@/pabx/accountcode/edit-account-code.page';
import { TrunkPage } from '@/pabx/trunk/trunks.page';

export default [
    { path: 'peers', component: PeerPage, data: { breadcrumb: 'Ramais' } },
    { path: 'aliases', component: AliasPage, data: { breadcrumb: 'Alias de Discagem' } },
    { path: 'aliases/new', component: NewAliasPage, data: { breadcrumb: 'Novo Alias' } },
    { path: 'aliases/edit/:id', component: EditAliasPage, data: { breadcrumb: 'Editar Alias' } },
    { path: 'dialplans', component: DialplanPage, data: { breadcrumb: 'Regras de Discagem' } },
    { path: 'dialplans/new', component: NewDialplanPage, data: { breadcrumb: 'Nova Regra' } },
    { path: 'accountcodes', component: AccountCodePage, data: { breadcrumb: 'Centro de Custos' } },
    { path: 'accountcodes/new', component: NewAccountCodePage, data: { breadcrumb: 'Novo Centro de Custo' } },
    { path: 'accountcodes/edit/:id', component: EditAccountCodePage, data: { breadcrumb: 'Editar Centro de Custo' } },
    { path: 'trunks', component: TrunkPage, data: { breadcrumb: 'Troncos' } },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
