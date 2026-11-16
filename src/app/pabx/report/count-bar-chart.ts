export interface CountBar {
    readonly label: string;
    readonly count: number;
    readonly percentage: number;
}

const percentFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function barLabel(bar: CountBar): string {
    return `${bar.label}: ${bar.count} (${percentFormat.format(bar.percentage)}%)`;
}

/** Gráfico de barras: uma barra por item, rótulo com quantidade e percentual. */
export function buildCountBarChart(bars: CountBar[], unit: string) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const barColor = documentStyle.getPropertyValue('--p-primary-500');

    const data = {
        labels: bars.map(barLabel),
        datasets: [
            {
                label: unit,
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
            tooltip: {
                callbacks: {
                    label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y} ${unit.toLocaleLowerCase('pt-BR')}`
                }
            }
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
                title: { display: true, text: unit, color: textColor }
            }
        }
    };

    return { data, options };
}

const SURVEY_ANSWERS = [1, 2, 3, 4, 5];

/** Notas de 1 a 5 de uma pergunta e quem não respondeu; percentual sobre o total de respostas. */
export function answerBars(answers: (number | null | undefined)[]): CountBar[] {
    const total = answers.length;
    const percentage = (count: number) => (total ? (count / total) * 100 : 0);
    const bars = SURVEY_ANSWERS.map((value) => {
        const count = answers.filter((answer) => answer === value).length;
        return { label: `${value}`, count, percentage: percentage(count) };
    });
    const unanswered = unansweredCount(answers);
    return [...bars, { label: 'Não respondeu', count: unanswered, percentage: percentage(unanswered) }];
}

/** Quantos não responderam a pergunta (desligaram antes ou não digitaram uma nota válida). */
export function unansweredCount(answers: (number | null | undefined)[]): number {
    return answers.filter((answer) => answer == null).length;
}
