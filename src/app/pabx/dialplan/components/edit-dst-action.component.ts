import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { InputNumber } from 'primeng/inputnumber';

@Component({
    selector: 'app-edit-dst-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, InputText, Message, ToggleSwitch, InputNumber],
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
                <div class="flex gap-4 items-center">
                    <div class="field">
                        <label for="addNumber" class="block">Adicionar</label>
                        <input
                            id="addNumber"
                            pInputText
                            class="p-inputtext"
                            [(ngModel)]="addNumber"
                            (ngModelChange)="onAddNumberChange($event)"
                        />
                    </div>
                    <div class="field">
                        <label for="isReplaceAllDst" class="block">Substituir todo destino</label>
                        <p-toggleswitch
                            [(ngModel)]="isReplaceAllDst"
                            (ngModelChange)="onIsReplaceAllDstChange($event)"
                        />
                    </div>
                </div>

                <div class="field">
                    <label for="cutNumber" class="block">Cortar</label>
                    <p-input-number
                        id="cutNumber"
                        [useGrouping]="false"
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
    @Input() cutNumber: string = '';
    @Output() cutNumberChange = new EventEmitter<string>();
    @Input() isReplaceAllDst = false;
    @Output() isReplaceAllDstChange = new EventEmitter<boolean>();
    addNumber: string = '';

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

    onCutNumberChange(cutNumber: string): void {
        this.cutNumber = cutNumber;
        this.cutNumberChange.emit(cutNumber);
    }

    onIsReplaceAllDstChange(isReplaceAllNumber: boolean): void {
        this.isReplaceAllDst = isReplaceAllNumber;
        this.isReplaceAllDstChange.emit(isReplaceAllNumber);
    }
}
