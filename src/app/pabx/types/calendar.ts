import { CalendarTypeEnum } from '@/pabx/types/calendar-type-enum';
import { DialPlanAction } from '@/pabx/types/dial-plan-action';
import { WeekDayEnum } from '@/pabx/types/week-day-enum';

export interface Calendar {
    readonly id: number;
    readonly companyId: string;
    readonly name: string;
    readonly calendarTypeEnum: CalendarTypeEnum;
    readonly rangeDates?: Date[];
    readonly weekDays?: WeekDayEnum[];
    readonly startTime: string;
    readonly endTime: string;
    readonly actions: DialPlanAction[];
}
