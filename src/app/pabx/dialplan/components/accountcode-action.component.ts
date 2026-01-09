import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { AccountCodeService } from '@/pabx/accountcode/account-code.service';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'app-account-code-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, Select, Tooltip],
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
                    >
                        <ng-template #selectedItem let-selectedOption>
                            <div class="flex items-center gap-2">
                                <div>{{ selectedOption.label }}</div>
                                @if (selectedOption.cost == 0) {
                                    <i class="pi pi-exclamation-circle" style="color: red" pTooltip="Custo zero"></i>
                                }
                            </div>
                        </ng-template>
                        <ng-template let-account #item>
                            <div class="flex items-center gap-2">
                                <div>{{ account.label }}</div>
                                @if (account.cost == 0) {
                                    <i class="pi pi-exclamation-circle" style="color: red" pTooltip="Custo zero"></i>
                                }
                            </div>
                        </ng-template>
                    </p-select>
                    @if (showError) {
                        <small class="p-error block mt-2">Centro de Custo é obrigatório.</small>
                    }
                </div>
            </div>
        </p-panel>
    `
})
export class AccountCodeActionComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    value: string = '';
    accountCodeOptions: { label: string; value: string; cost: number }[] = [];

    constructor(private readonly accountCodeService: AccountCodeService) {}

    ngOnInit(): void {
        this.accountCodeService.findAll().then((accountCodes) => {
            this.accountCodeOptions = accountCodes.map((accountCode) => ({
                label: `${accountCode.code} - ${accountCode.title}`,
                value: accountCode.code,
                cost: accountCode.cost
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
