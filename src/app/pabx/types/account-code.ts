export type SpecialLabel = '0800' | '4000' | null;

export const SPECIAL_LABEL_OPTIONS: { label: string; value: SpecialLabel }[] = [
    { label: 'Nenhuma', value: null },
    { label: '0800', value: '0800' },
    { label: '4000', value: '4000' }
];

/** Label especial só vale para códigos de receita (prefixo "1."). */
export const allowsSpecialLabel = (code?: string | null): boolean => !!code && code.startsWith('1.');

export interface AccountCode {
    readonly id: number;
    readonly companyId: string;
    readonly code: string;
    readonly title: string;
    readonly cadence: number;
    readonly fraction: number;
    readonly cost: number;
    readonly specialLabel?: SpecialLabel;
    readonly updatedAt?: Date;
}
