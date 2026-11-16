import {Ura} from '@/pabx/types/ura';

/** Rótulo da opção no relatório: "1 - Exames Laboratoriais", ou só "1" sem descrição. */
export function uraOptionLabel(optionDigit: number, ura: Ura): string {
    if (optionDigit === ura.invalidAction?.option) return 'Opção inválida';
    if (optionDigit === ura.timeoutAction?.option) return 'Tempo esgotado';
    const description = ura.actions.find((action) => action.option === optionDigit)?.description?.trim();
    return description ? `${optionDigit} - ${description}` : `${optionDigit}`;
}
