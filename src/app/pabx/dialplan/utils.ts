import { DialPlanActionEnum, SrcEnum } from '@/pabx/types';

const srcOptions = [
    { label: 'Qualquer', value: SrcEnum.ANY },
    { label: 'Ramal', value: SrcEnum.PEER },
    { label: 'Expressão Regular', value: SrcEnum.EXPRESSION },
    { label: 'Alias', value: SrcEnum.ALIAS },
    { label: 'Tronco', value: SrcEnum.TRUNK }
];

export function dialplanSrcOptions(): { value: string; label: string }[] {
    return Object.values(SrcEnum).map((value) => ({
        value,
        label: srcOptions.find((src) => src.value === value)?.label ?? value
    }));
}

export function dialplanSrcLabel(srcEnum: SrcEnum): string {
    return srcOptions.find((src) => src.value === srcEnum)?.label ?? 'Desconhecido';
}

export function dialplanActionOptions() {
    return [
        { label: 'Centro de Custo', value: DialPlanActionEnum.ACCOUNT_CODE },
        { label: 'Ramal', value: DialPlanActionEnum.DIAL_PEER },
        { label: 'Rota', value: DialPlanActionEnum.DIAL_ROUTE },
        { label: 'Tocar Audio', value: DialPlanActionEnum.PLAYBACK },
        { label: 'Definir Variável', value: DialPlanActionEnum.SET_VARIABLE },
        { label: 'Editar Destino', value: DialPlanActionEnum.EDIT_DST },
        { label: 'Calendário', value: DialPlanActionEnum.CALENDAR },
        { label: 'Grupo de Chamada', value: DialPlanActionEnum.CALL_GROUP },
        { label: 'URA', value: DialPlanActionEnum.URA },
        { label: 'Fila', value: DialPlanActionEnum.QUEUE },
        { label: 'Atender', value: DialPlanActionEnum.ANSWER },
        { label: 'Desligar', value: DialPlanActionEnum.HANGUP }
    ];
}

export function calendarActionOptions() {
    return [
        { label: 'Ramal', value: DialPlanActionEnum.DIAL_PEER },
        { label: 'Tocar Audio', value: DialPlanActionEnum.PLAYBACK },
        { label: 'Fila', value: DialPlanActionEnum.QUEUE },
        { label: 'Desligar', value: DialPlanActionEnum.HANGUP }
    ];
}
