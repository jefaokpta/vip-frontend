import {answerBars, buildCountBarChart, unansweredCount} from '@/pabx/report/count-bar-chart';

describe('buildCountBarChart', () => {
    it('uma barra por item, com quantidade e percentual no rótulo', () => {
        const { data } = buildCountBarChart(
            [
                { label: '1 - Exames Laboratoriais', count: 3, percentage: 75 },
                { label: '2', count: 1, percentage: 25 },
                { label: '3', count: 0, percentage: 0 }
            ],
            'Seleções'
        );

        expect(data.labels).toEqual(['1 - Exames Laboratoriais: 3 (75,0%)', '2: 1 (25,0%)', '3: 0 (0,0%)']);
        expect(data.datasets.length).toBe(1);
        expect(data.datasets[0].data).toEqual([3, 1, 0]);
    });

    it('eixo de quantidade começa em zero, usa inteiros e mostra a unidade', () => {
        const { options } = buildCountBarChart([{ label: '1', count: 1, percentage: 100 }], 'Respostas');

        expect(options.scales.y.beginAtZero).toBeTrue();
        expect(options.scales.y.ticks.precision).toBe(0);
        expect(options.scales.y.title.text).toBe('Respostas');
    });
});

describe('answerBars', () => {
    it('conta cada nota de 1 a 5 e quem não respondeu; percentual sobre o total', () => {
        const bars = answerBars([5, 5, 4, 1, undefined, null, 5, 5]);

        expect(bars.map((b) => b.label)).toEqual(['1', '2', '3', '4', '5', 'Não respondeu']);
        expect(bars.map((b) => b.count)).toEqual([1, 0, 0, 1, 4, 2]);
        expect(bars.map((b) => b.percentage)).toEqual([12.5, 0, 0, 12.5, 50, 25]);
    });

    it('sem respostas, tudo zero', () => {
        expect(answerBars([]).map((b) => b.percentage)).toEqual([0, 0, 0, 0, 0, 0]);
    });
});

describe('unansweredCount', () => {
    it('conta quem não respondeu a pergunta', () => {
        expect(unansweredCount([5, undefined, 3, null, undefined])).toBe(3);
    });

    it('zero quando todos responderam', () => {
        expect(unansweredCount([1, 2])).toBe(0);
    });
});
