import {Ura} from '@/pabx/types/ura';

export interface OptionBar {
    readonly label: string;
    readonly count: number;
    readonly percentage: number;
}

const percentFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function barLabel(bar: OptionBar): string {
    return `${bar.label}: ${bar.count} (${percentFormat.format(bar.percentage)}%)`;
}

/** Rótulo da opção no relatório: "1 - Exames Laboratoriais", ou só "1" sem descrição. */
export function uraOptionLabel(optionDigit: number, ura: Ura): string {
    if (optionDigit === ura.invalidAction?.option) return 'Opção inválida';
    if (optionDigit === ura.timeoutAction?.option) return 'Tempo esgotado';
    const description = ura.actions.find((action) => action.option === optionDigit)?.description?.trim();
    return description ? `${optionDigit} - ${description}` : `${optionDigit}`;
}

/** Gráfico de barras com a quantidade de vezes que cada opção foi discada. */
export function buildOptionBarChart(bars: OptionBar[]) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const barColor = documentStyle.getPropertyValue('--p-primary-500');

    const data = {
        labels: bars.map(barLabel),
        datasets: [
            {
                label: 'Seleções',
                data: bars.map((bar) => bar.count),
                backgroundColor: barColor,
                borderColor: barColor,
                borderRadius: 4,
                maxBarThickness: 48
            }
        ]
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y} seleções` } }
        },
        scales: {
            x: {
                ticks: { color: textColorSecondary },
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                ticks: { color: textColorSecondary, precision: 0 },
                grid: { color: surfaceBorder, drawTicks: false },
                title: { display: true, text: 'Seleções', color: textColor }
            }
        }
    };

    return { data, options };
}
