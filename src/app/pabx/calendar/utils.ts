import { CalendarTypeEnum, WeekDayEnum } from '@/pabx/types';

export const calendarTypeOptions = [
    { label: 'Datas', value: CalendarTypeEnum.DATES },
    { label: 'Dias da Semana', value: CalendarTypeEnum.WEEKDAYS }
];

export const calendarWeekDays = [
    { label: 'Dom', value: WeekDayEnum.SUNDAY },
    { label: 'Seg', value: WeekDayEnum.MONDAY },
    { label: 'Ter', value: WeekDayEnum.TUESDAY },
    { label: 'Qua', value: WeekDayEnum.WEDNESDAY },
    { label: 'Qui', value: WeekDayEnum.THURSDAY },
    { label: 'Sex', value: WeekDayEnum.FRIDAY },
    { label: 'Sáb', value: WeekDayEnum.SATURDAY }
];
