/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */

import {Cdr} from '@/pabx/types/cdr';
import {dispositionSeverity, dispositionTranslate} from '@/pabx/report/cdr-format';

export interface ChartBucket {
    key: string;
    label: string;
}

export function bucketKey(date: Date, singleDay: boolean): string {
    if (singleDay) return String(date.getHours());
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function hourlyBuckets(cdrs: Cdr[]): ChartBucket[] {
    const activeHours = new Set(cdrs.map((c) => new Date(c.startTime).getHours()));
    return Array.from(activeHours)
        .sort((a, b) => a - b)
        .map((h) => ({ key: String(h), label: `${String(h).padStart(2, '0')}:00` }));
}

export function dailyBuckets(start: Date, end: Date): ChartBucket[] {
    const buckets: ChartBucket[] = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setHours(0, 0, 0, 0);
    while (cursor.getTime() <= last.getTime()) {
        buckets.push({
            key: bucketKey(cursor, false),
            label: `${String(cursor.getDate()).padStart(2, '0')}/${String(cursor.getMonth() + 1).padStart(2, '0')}`
        });
        cursor.setDate(cursor.getDate() + 1);
    }
    return buckets;
}

/** Linhas do gráfico: uma série por status da chamada, contando chamadas por bucket. */
export function buildCallsChart(cdrs: Cdr[], buckets: ChartBucket[], singleDay: boolean) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const dispositions = Array.from(new Set(cdrs.map((c) => c.disposition))).sort();

    const data = {
        labels: buckets.map((b) => b.label),
        datasets: dispositions.map((d) => ({
            label: dispositionTranslate(d),
            borderColor: severityColor(d, documentStyle),
            backgroundColor: severityColor(d, documentStyle),
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            data: buckets.map(
                (b) =>
                    cdrs.filter((c) => c.disposition === d && bucketKey(new Date(c.startTime), singleDay) === b.key)
                        .length
            )
        }))
    };

    const options = {
        animation: { duration: 1000 },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: textColor, usePointStyle: true, font: { weight: 700 }, padding: 20 }
            }
        },
        scales: {
            x: {
                ticks: { color: textColorSecondary, font: { weight: 500 } },
                grid: { display: false, drawBorder: false }
            },
            y: {
                ticks: { color: textColorSecondary },
                grid: { color: surfaceBorder, drawBorder: false },
                beginAtZero: true
            }
        }
    };

    return { data, options };
}

function severityColor(disposition: string, documentStyle: CSSStyleDeclaration): string {
    switch (dispositionSeverity(disposition)) {
        case 'success':
            return documentStyle.getPropertyValue('--p-green-500');
        case 'warn':
            return documentStyle.getPropertyValue('--p-yellow-500');
        case 'danger':
            return documentStyle.getPropertyValue('--p-red-500');
        default:
            return documentStyle.getPropertyValue('--p-surface-400');
    }
}
