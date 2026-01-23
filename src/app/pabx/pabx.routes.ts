import { Routes } from '@angular/router';
import { DialplanPage } from '@/pabx/dialplan/dialplan.page';
import { AliasPage } from '@/pabx/alias/alias.page';
import { NewAliasPage } from '@/pabx/alias/new-alias.page';
import { EditAliasPage } from '@/pabx/alias/edit-alias.page';
import { NewDialplanPage } from '@/pabx/dialplan/new-dialplan/new-dialplan.page';
import { AccountCodePage } from '@/pabx/accountcode/account-code.page';
import { NewAccountCodePage } from '@/pabx/accountcode/new-account-code.page';
import { EditAccountCodePage } from '@/pabx/accountcode/edit-account-code.page';
import { TrunkPage } from '@/pabx/trunk/trunks.page';
import { NewTrunkPage } from '@/pabx/trunk/new-trunk.page';
import { EditTrunkPage } from '@/pabx/trunk/edit-trunk.page';
import { RoutePage } from './route/routes.page';
import { NewRoutePage } from '@/pabx/route/new-route.page';
import { EditRoutePage } from '@/pabx/route/edit-route.page';
import { EditDialplanPage } from '@/pabx/dialplan/edit-dialplan/edit-dialplan.page';
import { NewPeerPage } from '@/pabx/peer/new-peer.page';
import { PeerPage } from '@/pabx/peer/peer.page';

export default [
    { path: 'peers', component: PeerPage, data: { breadcrumb: 'Ramais' } },
    { path: 'peers/new', component: NewPeerPage, data: { breadcrumb: 'Novo' } },
    { path: 'aliases', component: AliasPage, data: { breadcrumb: 'Alias de Discagem' } },
    { path: 'aliases/new', component: NewAliasPage, data: { breadcrumb: 'Novo' } },
    { path: 'aliases/edit/:id', component: EditAliasPage, data: { breadcrumb: 'Editar' } },
    { path: 'dialplans', component: DialplanPage, data: { breadcrumb: 'Regras de Discagem' } },
    { path: 'dialplans/new', component: NewDialplanPage, data: { breadcrumb: 'Nova' } },
    { path: 'dialplans/edit/:id', component: EditDialplanPage, data: { breadcrumb: 'Editar' } },
    { path: 'accountcodes', component: AccountCodePage, data: { breadcrumb: 'Centro de Custos' } },
    { path: 'accountcodes/new', component: NewAccountCodePage, data: { breadcrumb: 'Novo' } },
    { path: 'accountcodes/edit/:id', component: EditAccountCodePage, data: { breadcrumb: 'Editar' } },
    { path: 'trunks', component: TrunkPage, data: { breadcrumb: 'Troncos' } },
    { path: 'trunks/new', component: NewTrunkPage, data: { breadcrumb: 'Novo' } },
    { path: 'trunks/edit/:id', component: EditTrunkPage, data: { breadcrumb: 'Editar' } },
    { path: 'routes', component: RoutePage, data: { breadcrumb: 'Rotas' } },
    { path: 'routes/new', component: NewRoutePage, data: { breadcrumb: 'Nova' } },
    { path: 'routes/edit/:id', component: EditRoutePage, data: { breadcrumb: 'Editar' } },

    { path: '**', redirectTo: '/notfound' }
] as Routes;
