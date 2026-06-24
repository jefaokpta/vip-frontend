import { AliasExpression } from '@/pabx/types/alias-expression';

export interface Alias {
    readonly id: number;
    readonly name: string;
    readonly companyId: string;
    readonly expressions: AliasExpression[];
}
