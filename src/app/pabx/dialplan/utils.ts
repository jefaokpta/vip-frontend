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
    //todo: fila de atendimento, grupo de ramais, ura de atendimento
    return [
        { label: 'Atender', value: DialPlanActionEnum.ANSWER },
        { label: 'Desligar', value: DialPlanActionEnum.HANGUP },
        { label: 'Centro de Custo', value: DialPlanActionEnum.ACCOUNT_CODE },
        { label: 'Ramal', value: DialPlanActionEnum.DIAL_PEER },
        { label: 'Rota', value: DialPlanActionEnum.DIAL_ROUTE },
        { label: 'Tocar Audio', value: DialPlanActionEnum.PLAYBACK },
        { label: 'Definir Variável', value: DialPlanActionEnum.SET_VARIABLE },
        { label: 'Editar Destino', value: DialPlanActionEnum.EDIT_DST }
    ];
}
