import { SrcEnum } from '@/pabx/types';

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
