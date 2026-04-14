import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { QueueService } from '@/pabx/queue/queue.service';

@Component({
    selector: 'app-queue-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, Select],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => QueueActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Fila de Atendimento" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <div class="field mb-4">
                    <p-select
                        [options]="queueOptions"
                        [(ngModel)]="value"
                        (ngModelChange)="onValueChange($event)"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione a Fila"
                        appendTo="body"
                    ></p-select>
                    @if (showError) {
                        <small class="p-error block mt-2">Fila é obrigatória.</small>
                    }
                </div>
            </div>
        </p-panel>
    `
})
export class QueueActionComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    value: string = '';
    queueOptions: { label: string; value: string }[] = [];

    constructor(private readonly queueService: QueueService) {}

    ngOnInit() {
        this.queueService.findAll().then((queues) => {
            this.queueOptions = queues.map((queue) => ({
                label: queue.name,
                value: queue.id.toString()
            }));
        });
    }

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.value = value;
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onValueChange(value: string): void {
        this.value = value;
        this.onChange(value);
        this.onTouched();
    }
}
