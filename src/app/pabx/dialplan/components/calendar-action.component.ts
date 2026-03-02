import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { CalendarService } from '@/pabx/calendar/calendar.service';

@Component({
    selector: 'app-calendar-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, Select, Badge, Button],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CalendarActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Calendário" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                @if (selectedCalendars.length < 3) {
                    <div class="field">
                        <p-select
                            [options]="availableCalendarOptions"
                            [(ngModel)]="selectedOption"
                            (ngModelChange)="addCalendar($event)"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecione um Calendário"
                            appendTo="body"
                        ></p-select>
                        @if (showError && selectedCalendars.length === 0) {
                            <small class="p-error block mt-2">Calendário é obrigatório.</small>
                        }
                    </div>
                }
                <div class="flex gap-2 flex-wrap">
                    @for (cal of selectedCalendars; track cal.id) {
                        <p-badge [value]="cal.name" severity="info"></p-badge>
                        <p-button
                            icon="pi pi-times"
                            [rounded]="true"
                            [text]="true"
                            severity="danger"
                            size="small"
                            (onClick)="removeCalendar(cal.id)"
                        />
                    }
                </div>
            </div>
        </p-panel>
    `
})
export class CalendarActionComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    @Input() arg2: string = '';
    @Output() arg2Change = new EventEmitter<string>();
    @Input() arg3: string = '';
    @Output() arg3Change = new EventEmitter<string>();

    selectedOption: string = '';
    calendarOptions: { label: string; value: string; id: string }[] = [];
    selectedCalendars: { id: string; name: string }[] = [];
    private pendingArg1: string = '';

    constructor(private readonly calendarService: CalendarService) {}

    ngOnInit() {
        this.calendarService.findAll().then((calendars) => {
            this.calendarOptions = calendars.map((c) => ({
                label: c.name,
                value: c.id.toString(),
                id: c.id.toString()
            }));
            this.applyPendingValues();
        });
    }

    private applyPendingValues(): void {
        const args = [this.pendingArg1, this.arg2, this.arg3].filter((a) => !!a);
        this.selectedCalendars = [];
        for (const arg of args) {
            const option = this.calendarOptions.find((o) => o.value === arg);
            if (option && !this.selectedCalendars.some((c) => c.id === arg)) {
                this.selectedCalendars.push({ id: arg, name: option.label });
            }
        }
    }

    get availableCalendarOptions() {
        const selectedIds = new Set(this.selectedCalendars.map((c) => c.id));
        return this.calendarOptions.filter((o) => !selectedIds.has(o.id));
    }

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.pendingArg1 = value || '';
        if (value && this.calendarOptions.length > 0) {
            this.applyPendingValues();
        }
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    addCalendar(calendarId: string): void {
        if (!calendarId || this.selectedCalendars.length >= 3) return;
        const option = this.calendarOptions.find((o) => o.value === calendarId);
        if (!option || this.selectedCalendars.some((c) => c.id === calendarId)) return;
        this.selectedCalendars = [...this.selectedCalendars, { id: calendarId, name: option.label }];
        this.selectedOption = '';
        this.emitValues();
    }

    removeCalendar(calendarId: string): void {
        this.selectedCalendars = this.selectedCalendars.filter((c) => c.id !== calendarId);
        this.emitValues();
    }

    private emitValues(): void {
        const arg1 = this.selectedCalendars[0]?.id ?? '';
        const arg2 = this.selectedCalendars[1]?.id ?? '';
        const arg3 = this.selectedCalendars[2]?.id ?? '';
        this.onChange(arg1);
        this.onTouched();
        this.arg2 = arg2;
        this.arg2Change.emit(arg2);
        this.arg3 = arg3;
        this.arg3Change.emit(arg3);
    }
}
