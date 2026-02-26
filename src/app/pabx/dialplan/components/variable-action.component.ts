import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Panel} from "primeng/panel";
import {InputText} from "primeng/inputtext";
import {Message} from "primeng/message";
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-variable-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, InputText, Message, NgIf],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => VariableActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Define Variável de Controle" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <div class="field">
                    <label for="varName" class="block">Nome da Variável</label>
                    <input
                        id="varName"
                        pInputText
                        class="p-inputtext"
                        [(ngModel)]="varName"
                        (ngModelChange)="onValueChange($event)"
                    />
                    <small *ngIf="showError" class="p-error block mt-2"> Nome da variável é obrigatório. </small>
                </div>
                <div class="field">
                    <label for="varValue" class="block">Valor da Variável</label>
                    <input
                        id="varValue"
                        pInputText
                        class="p-inputtext"
                        [(ngModel)]="varValue"
                        (ngModelChange)="onVarValueChange($event)"
                    />
                    <small *ngIf="showVarValueError" class="p-error block mt-2">
                        Valor da variável é obrigatório.
                    </small>
                </div>
                <p-message severity="info">Cria variável de controle na chamada</p-message>
            </div>
        </p-panel>
    `
})
export class VariableActionComponent implements ControlValueAccessor {
    @Input() showError = false;
    @Input() showVarValueError = false;
    @Input() varValue: string = '';
    @Output() varValueChange = new EventEmitter<string>();
    varName: string = '';

    private onChange: (value: string) => void = () => {};

    private onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.varName = value;
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onValueChange(value: string): void {
        this.varName = value;
        this.onChange(value);
        this.onTouched();
    }

    onVarValueChange(varValue: string): void {
        this.varValue = varValue;
        this.varValueChange.emit(varValue);
    }
}
