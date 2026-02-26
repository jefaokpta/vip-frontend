import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-edit-dst-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, InputText, Message, NgIf],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EditDstActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Editar Destino" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <div class="field">
                    <label for="addNumber" class="block">Número a ser adicionado</label>
                    <input
                        id="addNumber"
                        pInputText
                        class="p-inputtext"
                        [(ngModel)]="addNumber"
                        (ngModelChange)="onAddNumberChange($event)"
                    />
                    <small *ngIf="showError" class="p-error block mt-2"> Número é obrigatório. </small>
                </div>
                <div class="field">
                    <label for="cutNumber" class="block">Números cortados</label>
                    <input
                        id="cutNumber"
                        pInputText
                        class="p-inputtext"
                        [(ngModel)]="cutNumber"
                        (ngModelChange)="onCutNumberChange($event)"
                    />
                </div>
                <p-message severity="info">Edita número de destino</p-message>
            </div>
        </p-panel>
    `
})
export class EditDstActionComponent implements ControlValueAccessor {
    @Input() showError = false;
    @Output() cutNumberChange = new EventEmitter<string>();
    addNumber: string = '';
    cutNumber: string = '';

    private onChange: (value: string) => void = () => {};

    private onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.addNumber = value;
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onAddNumberChange(value: string): void {
        this.addNumber = value;
        this.onChange(value);
        this.onTouched();
    }

    onCutNumberChange(flags: string): void {
        this.cutNumber = flags;
        this.cutNumberChange.emit(flags);
    }
}
