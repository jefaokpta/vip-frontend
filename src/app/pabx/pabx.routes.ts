import {Routes} from '@angular/router';
import {PeerPage} from "@/pabx/peer/peer.page";
import {DialplanPage} from "@/pabx/dialplan/dialplan.page";
import {AliasPage} from "@/pabx/alias/alias.page";
import {NewAliasPage} from "@/pabx/alias/new-alias.page";

export default [
    {path: 'peers', component: PeerPage, data: {breadcrumb: 'Ramais'}},
    {path: 'dialplans', component: DialplanPage, data: {breadcrumb: 'Regras de Discagem'}},
    {path: 'aliases', component: AliasPage, data: {breadcrumb: 'Alias de Discagem'}},
    {path: 'aliases/new', component: NewAliasPage, data: {breadcrumb: 'Novo Alias de Discagem'}},
    {path: '**', redirectTo: '/notfound'}
] as Routes;
