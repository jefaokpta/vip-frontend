import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { CallGroupService } from '@/pabx/call-group/call-group.service';

@Component({
    selector: 'app-call-group-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, Select],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CallGroupActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Chamar Grupo de Chamada" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <div class="field mb-4">
                    <p-select
                        [options]="callGroupOptions"
                        [(ngModel)]="value"
                        (ngModelChange)="onValueChange($event)"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o Grupo de Chamada"
                        appendTo="body"
                    ></p-select>
                    @if (showError) {
                        <small class="p-error block mt-2">Grupo de chamada é obrigatório.</small>
                    }
                </div>
            </div>
        </p-panel>
    `
})
export class CallGroupActionComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    value: string = '';
    callGroupOptions: { label: string; value: string }[] = [];

    constructor(private readonly callGroupService: CallGroupService) {}

    ngOnInit() {
        this.callGroupService.findAll().then((groups) => {
            this.callGroupOptions = groups.map((group) => ({
                label: group.name,
                value: group.id.toString()
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
