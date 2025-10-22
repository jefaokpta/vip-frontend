import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '@/layout/service/layout.service';
import { Cdr, UserFieldEnum } from '@/types/types';

@Component({
    standalone: true,
    selector: 'app-call-overview-component',
    imports: [SelectModule, ChartModule, FormsModule],
    template: ` <div class="card h-full">
        <div class="flex items-start justify-between mb-12">
            <span class="text-surface-900 dark:text-surface-0 text-xl font-semibold">Visão das Ligações</span>
        </div>
        <p-chart type="bar" height="300" [data]="barData" [options]="barOptions"></p-chart>
    </div>`
})
export class CallOverviewComponent implements OnChanges, OnDestroy {
    barData: any;
    barOptions: any;
    subscription: Subscription;
    @Input() cdrsInput!: Cdr[];
    cdrs: Cdr[] = [];

    constructor(private readonly layoutService: LayoutService) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(50)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnChanges(): void {
        this.cdrs = this.cdrsInput;
        this.initChart();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        const week = this.last7DaysFromNow();

        this.barData = {
            labels: week.map((day) => day.weekDay),
            datasets: [
                {
                    label: 'Saída',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    barThickness: 12,
                    borderRadius: 12,
                    data: week.map((day) => day.outboundCalls)
                },
                {
                    label: 'Entrada',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    barThickness: 12,
                    borderRadius: 12,
                    data: week.map((day) => day.inboundCalls)
                }
            ]
        };

        this.barOptions = {
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
                        },
                        padding: 28
                    },
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    private getOutboundCallsSumByDate(date: Date): number {
        return this.cdrs.filter((cdr) => this.compareDates(date, new Date(cdr.startTime)) && cdr.userfield === UserFieldEnum.OUTBOUND).length;
    }

    private getInboundCallsSumByDate(date: Date): number {
        return this.cdrs.filter((cdr) => this.compareDates(date, new Date(cdr.startTime)) && cdr.userfield === UserFieldEnum.INBOUND).length;
    }

    private compareDates(date1: Date, date2: Date): boolean {
        return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    }

    private last7DaysFromNow(): ChartData[] {
        const today = new Date();
        const last7Days: ChartData[] = [];
        for (let i = 0; i < 7; i++) {
            const day = this.subtractDays(today, i);
            last7Days.push({
                weekDay: day.toLocaleDateString('pt-BR', { weekday: 'long' }).substring(0, 3).toUpperCase(),
                outboundCalls: this.getOutboundCallsSumByDate(day),
                inboundCalls: this.getInboundCallsSumByDate(day)
            });
        }
        return last7Days.reverse();
    }

    private subtractDays(date: Date, lessDays: number): Date {
        const result = new Date(date);
        result.setDate(date.getDate() - lessDays);
        return result;
    }
}

interface ChartData {
    weekDay: string;
    outboundCalls: number;
    inboundCalls: number;
}
