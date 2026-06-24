import { AttendantTypeEnum } from '@/types/attendant-type-enum';

export interface Attendant {
    readonly id: number;
    readonly name: string;
    readonly attendantId: number;
    readonly attendantTypeEnum: AttendantTypeEnum;
}
