import {Component, Input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {NgIf} from '@angular/common';
import {DDR_MAX_DIGITS, formatDdr, onlyDigits} from '@/pabx/ddr/ddr-format';

@Component({
    selector: 'app-ddr-field',
    standalone: true,
    imports: [InputText, NgIf, ReactiveFormsModule],
    template: `
        <div class="field mb-4">
            <label for="ddr" class="block mb-2">Telefone *</label>
            <input
                id="ddr"
                pInputText
                class="p-inputtext"
                [formControl]="control"
                placeholder="Ex: (11) 3212-1234"
                (input)="onDdrInput($event)"
            />
            <small *ngIf="control.invalid && (control.dirty || control.touched)" class="p-error block mt-2">
                <div *ngIf="control.errors?.['required']">Telefone é obrigatório.</div>
                <div *ngIf="control.errors?.['ddrFormat']">
                    Formato inválido. Use DDD+número, operadora+DDD+número, 0+operadora+DDD+número ou 0800.
                </div>
            </small>
        </div>
    `
})
export class DdrFieldComponent {
    @Input({required: true}) control!: FormControl;

    onDdrInput(event: Event) {
        const digits = onlyDigits((event.target as HTMLInputElement).value).slice(0, DDR_MAX_DIGITS);
        this.control.setValue(formatDdr(digits));
    }
}
