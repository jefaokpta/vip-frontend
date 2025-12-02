import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-trunk-select-component',
    standalone: true,
    imports: [Select, NgIf, ReactiveFormsModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TrunkSelectComponent),
            multi: true
        }
    ],
    template: `
        <div class="field mb-4">
            <label for="trunk" class="block mb-2">Tronco *</label>
            <p-select
                id="trunk"
                [options]="trunkOptions"
                [(ngModel)]="value"
                (ngModelChange)="onValueChange($event)"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione um tronco"
            ></p-select>
            <small *ngIf="showError" class="p-error block mt-2">
                Tronco é obrigatório.
            </small>
        </div>
    `
})
export class TrunkSelectComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    value: string = '';
    trunkOptions: { label: string; value: string }[] = [];

    constructor() {
    }

    ngOnInit() {
        this.trunkOptions = [
            {label: 'Jupiter', value: '1'},
            {label: 'Tronco 2', value: '2'}
        ];
    }

    private onChange: (value: string) => void = () => {
    };

    private onTouched: () => void = () => {
    };

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
