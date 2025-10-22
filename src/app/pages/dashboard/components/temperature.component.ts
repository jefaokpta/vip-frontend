import { Component, Input, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { Cdr, TemperatureEnum } from '@/types/types';

@Component({
    standalone: true,
    selector: 'app-temperature-component',
    imports: [ChartModule],
    template: ` <div class="card h-full">
        <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-4">Temperaturas</div>
        <p-chart type="pie" [data]="pieData" height="300" [options]="pieOptions"></p-chart>
    </div>`
})
export class TemperatureComponent implements OnChanges {
    @Input() cdrsInput!: Cdr[];
    pieData: any;
    pieOptions: any;

    ngOnChanges() {
        this.initChart();
    }

    private getTemperatureSum(): number[] {
        const temperatureSums = [0, 0, 0];
        this.cdrsInput.forEach((cdr) => {
            if (cdr.temperature === TemperatureEnum.QUENTE) temperatureSums[0]++;
            else if (cdr.temperature === TemperatureEnum.MORNA) temperatureSums[1]++;
            else if (cdr.temperature === TemperatureEnum.FRIA) temperatureSums[2]++;
        });
        return temperatureSums;
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.pieData = {
            labels: ['Quente', 'Morna', 'Fria'],
            datasets: [
                {
                    data: this.getTemperatureSum(),
                    backgroundColor: [
                        documentStyle.getPropertyValue('--p-primary-700'),
                        documentStyle.getPropertyValue('--p-primary-400'),
                        documentStyle.getPropertyValue('--p-primary-100')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--p-primary-600'),
                        documentStyle.getPropertyValue('--p-primary-300'),
                        documentStyle.getPropertyValue('--p-primary-200')
                    ]
                }
            ]
        };
        this.pieOptions = {
            animation: {
                duration: 2000
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        font: {
                            weight: 700
                        }
                    },
                    position: 'bottom'
                }
            }
        };
    }
}
