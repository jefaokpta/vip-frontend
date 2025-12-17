import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Panel} from "primeng/panel";
import {NgIf} from "@angular/common";
import {Select} from "primeng/select";
import {AccountCodeService} from "@/pabx/accountcode/account-code.service";

@Component({
    selector: 'app-account-code-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, NgIf, Select],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AccountCodeActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Definir Centro de Custo" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <div class="field mb-4">
                    <p-select
                        id="code"
                        [options]="accountCodeOptions"
                        [(ngModel)]="value"
                        (ngModelChange)="onValueChange($event)"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o Centro de Custo"
                        appendTo="body"
                    ></p-select>
                    <small *ngIf="showError" class="p-error block mt-2">
                        Centro de Custo é obrigatório.
                    </small>
                </div>
            </div>

        </p-panel>
    `
})
export class AccountCodeActionComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    value: string = '';
    accountCodeOptions: { label: string; value: string }[] = [];

    constructor(private readonly accountCodeService: AccountCodeService) {
    }

    ngOnInit(): void {
        this.accountCodeService.findAll().then((accountCodes) => {
            this.accountCodeOptions = accountCodes.map((accountCode) => ({
                label: accountCode.title,
                value: accountCode.code,
            }));
        });
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
