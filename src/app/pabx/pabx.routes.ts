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
import { EditPeerPage } from '@/pabx/peer/edit-peer.page';
import { CalendarPage } from '@/pabx/calendar/calendar.page';
import { NewCalendarPage } from '@/pabx/calendar/new-calendar.page';
import { EditCalendarPage } from '@/pabx/calendar/edit-calendar.page';
import { MohsPage } from '@/pabx/moh/mohs.page';
import { NewMohPage } from '@/pabx/moh/new-moh.page';
import { EditMohPage } from '@/pabx/moh/edit-moh.page';
import { SettingsPage } from '@/pabx/settings/settings.page';
import { PickupGroupsPage } from '@/pabx/pickup-group/pickup-groups.page';
import { NewPickupGroupPage } from '@/pabx/pickup-group/new-pickup-group.page';
import { EditPickupGroupPage } from '@/pabx/pickup-group/edit-pickup-group.page';

export default [
    { path: 'peers', component: PeerPage, data: { breadcrumb: 'Ramais' } },
    { path: 'peers/new', component: NewPeerPage, data: { breadcrumb: 'Ramais > Novo' } },
    { path: 'peers/edit/:id', component: EditPeerPage, data: { breadcrumb: 'Ramais > Editar' } },
    { path: 'aliases', component: AliasPage, data: { breadcrumb: 'Alias de Discagem' } },
    { path: 'aliases/new', component: NewAliasPage, data: { breadcrumb: 'Alias > Novo' } },
    { path: 'aliases/edit/:id', component: EditAliasPage, data: { breadcrumb: 'Alias > Editar' } },
    { path: 'dialplans', component: DialplanPage, data: { breadcrumb: 'Regras de Discagem' } },
    { path: 'dialplans/new', component: NewDialplanPage, data: { breadcrumb: 'Regras de Discagem > Nova' } },
    { path: 'dialplans/edit/:id', component: EditDialplanPage, data: { breadcrumb: 'Regras de Discagem > Editar' } },
    { path: 'accountcodes', component: AccountCodePage, data: { breadcrumb: 'Centro de Custos' } },
    { path: 'accountcodes/new', component: NewAccountCodePage, data: { breadcrumb: 'Centro de Custos > Novo' } },
    {
        path: 'accountcodes/edit/:id',
        component: EditAccountCodePage,
        data: { breadcrumb: 'Centro de Custos > Editar' }
    },
    { path: 'trunks', component: TrunkPage, data: { breadcrumb: 'Troncos' } },
    { path: 'trunks/new', component: NewTrunkPage, data: { breadcrumb: 'Troncos > Novo' } },
    { path: 'trunks/edit/:id', component: EditTrunkPage, data: { breadcrumb: 'Troncos > Editar' } },
    { path: 'routes', component: RoutePage, data: { breadcrumb: 'Rotas' } },
    { path: 'routes/new', component: NewRoutePage, data: { breadcrumb: 'Rotas > Nova' } },
    { path: 'routes/edit/:id', component: EditRoutePage, data: { breadcrumb: 'Rotas > Editar' } },
    { path: 'calendars', component: CalendarPage, data: { breadcrumb: 'Calendários' } },
    { path: 'calendars/new', component: NewCalendarPage, data: { breadcrumb: 'Calendários > Novo' } },
    { path: 'calendars/edit/:id', component: EditCalendarPage, data: { breadcrumb: 'Calendários > Editar' } },
    { path: 'mohs', component: MohsPage, data: { breadcrumb: 'Audios do Sistema' } },
    { path: 'mohs/new', component: NewMohPage, data: { breadcrumb: 'Audios do Sistema > Novo' } },
    { path: 'mohs/edit/:id', component: EditMohPage, data: { breadcrumb: 'Audios do Sistema > Editar' } },
    { path: 'settings', component: SettingsPage, data: { breadcrumb: 'Definições Gerais' } },
    { path: 'pickup-groups', component: PickupGroupsPage, data: { breadcrumb: 'Grupos de Captura' } },
    { path: 'pickup-groups/new', component: NewPickupGroupPage, data: { breadcrumb: 'Grupos de Captura > Novo' } },
    {
        path: 'pickup-groups/edit/:id',
        component: EditPickupGroupPage,
        data: { breadcrumb: 'Grupos de Captura > Editar' }
    },

    { path: '**', redirectTo: '/notfound' }
] as Routes;
