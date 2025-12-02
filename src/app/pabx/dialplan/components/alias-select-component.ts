// alias-select.component.ts
import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {NgIf} from '@angular/common';
import {AliasService} from "@/pabx/alias/alias.service";

@Component({
    selector: 'app-alias-select-component',
    standalone: true,
    imports: [Select, NgIf, ReactiveFormsModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AliasSelectComponent),
            multi: true
        }
    ],
    template: `
        <div class="field mb-4">
            <label for="alias" class="block mb-2">Alias *</label>
            <p-select
                id="alias"
                [options]="aliasOptions"
                [(ngModel)]="value"
                (ngModelChange)="onValueChange($event)"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione um alias"
            ></p-select>
            <small *ngIf="showError" class="p-error block mt-2">
                Alias é obrigatório.
            </small>
        </div>
    `
})
export class AliasSelectComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    value: string = '';
    aliasOptions: { label: string; value: string }[] = [];

    constructor(private readonly aliasService: AliasService) {
    }

    ngOnInit() {
        this.aliasService.findAll()
            .then(aliases => this.aliasOptions = aliases
                .map(alias => ({label: alias.name, value: alias.id.toString()})))
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
