import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {NgIf} from '@angular/common';
import {TrunkService} from '@/pabx/trunk/trunk.service';
import {UserService} from '@/pages/users/user.service';
import {RoleEnum} from '@/types/role-enum';

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
            <small *ngIf="showError" class="p-error block mt-2"> Tronco é obrigatório. </small>
        </div>
    `
})
export class TrunkSelectComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    @Input() isShowAnyTrunkLabel = false;
    value: string = '';
    trunkOptions: { label: string; value: string }[] = [];
    private trunks: { label: string; value: string }[] = [];

    constructor(
        private readonly trunkService: TrunkService,
        private readonly userService: UserService
    ) {}

    /** Troncos são do SBC: só o suporte SaaS escolhe um tronco específico; os demais só usam "TODOS". */
    get canChooseTrunk(): boolean {
        return this.userService.getUser().roles.includes(RoleEnum.ROLE_SAAS_SUPPORT);
    }

    ngOnInit() {
        this.trunkService
            .findOptions()
            .then((trunks) => {
                this.trunks = trunks.map((trunk) => ({ label: trunk.name, value: trunk.id.toString() }));
            })
            .catch(() => (this.trunks = []))
            .finally(() => this.buildOptions());
    }

    private buildOptions(): void {
        const any = { label: 'TODOS', value: 'ANY' };
        if (this.canChooseTrunk) {
            this.trunkOptions = this.isShowAnyTrunkLabel ? [any, ...this.trunks] : [...this.trunks];
            return;
        }
        // Mantém o tronco que a regra já tinha (definido pelo suporte), sem permitir trocar por outro.
        const current =
            this.value && this.value !== 'ANY' ? this.trunks.find((t) => t.value === this.value) : undefined;
        const kept =
            this.value && this.value !== 'ANY' ? [current ?? { label: `Tronco ${this.value}`, value: this.value }] : [];
        this.trunkOptions = [any, ...kept];
    }

    private onChange: (value: string) => void = () => {};

    private onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.value = value;
        this.buildOptions();
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
