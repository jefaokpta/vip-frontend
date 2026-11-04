import { Routes } from '@angular/router';
import { BlockedIpPage } from '@/pages/blocked-ip/blocked-ip.page';

export default [{ path: '', component: BlockedIpPage, data: { breadcrumb: 'Controle de IPs' } }] as Routes;
