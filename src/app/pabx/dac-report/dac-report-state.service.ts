import {Injectable, signal} from '@angular/core';
import {DacReportResponse, QueueOption} from '@/pabx/types/dac-report';

@Injectable({ providedIn: 'root' })
export class DacReportStateService {
    readonly selectedQueue = signal<QueueOption | null>(null);
    readonly dateRange = signal<Date[]>([]);

    private readonly _report = signal<DacReportResponse | null>(null);
    private readonly _loaded = signal<boolean>(false);
    readonly report = this._report.asReadonly();
    readonly loaded = this._loaded.asReadonly();

    setReport(report: DacReportResponse): void {
        this._report.set(report);
        this._loaded.set(true);
    }

    reset(): void {
        this._report.set(null);
        this._loaded.set(false);
        this.selectedQueue.set(null);
        this.dateRange.set([]);
    }
}
