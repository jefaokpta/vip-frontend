import { RouteTrunk } from '@/pabx/types/route-trunk';

export interface Route {
    readonly id: number;
    readonly name: string;
    readonly companyId: string;
    readonly timeout: number;
    readonly flags: string;
    readonly routeTrunks: RouteTrunk[];
}
