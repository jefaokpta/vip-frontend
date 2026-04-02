import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { UraService } from '@/pabx/ura/ura.service';

@Component({
    selector: 'app-ura-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, Select],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UraActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="URA de Atendimento" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <div class="field mb-4">
                    <p-select
                        [options]="uraOptions"
                        [(ngModel)]="value"
                        (ngModelChange)="onValueChange($event)"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione a URA"
                        appendTo="body"
                    ></p-select>
                    @if (showError) {
                        <small class="p-error block mt-2">URA é obrigatória.</small>
                    }
                </div>
            </div>
        </p-panel>
    `
})
export class UraActionComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    value: string = '';
    uraOptions: { label: string; value: string }[] = [];

    constructor(private readonly uraService: UraService) {}

    ngOnInit() {
        this.uraService.findAll().then((uras) => {
            this.uraOptions = uras.map((ura) => ({
                label: ura.name,
                value: ura.id.toString()
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
