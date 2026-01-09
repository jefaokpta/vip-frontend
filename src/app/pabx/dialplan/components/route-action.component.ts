import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { RouteService } from '@/pabx/route/route.service';

@Component({
    selector: 'app-route-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, Select],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RouteActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Chamar Rota" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <div class="field mb-4">
                    <p-select
                        [options]="routeOptions"
                        [(ngModel)]="value"
                        (ngModelChange)="onValueChange($event)"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione a Rota"
                        appendTo="body"
                    ></p-select>
                    @if (showError) {
                        <small class="p-error block mt-2">Rota é obrigatória.</small>
                    }
                </div>
            </div>
        </p-panel>
    `
})
export class RouteActionComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    value: string = '';
    routeOptions: { label: string; value: string }[] = [];

    constructor(private readonly routeService: RouteService) {}

    ngOnInit() {
        this.routeService.findAll().then((routes) => {
            this.routeOptions = routes.map((route) => ({
                label: route.name,
                value: route.id.toString()
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
