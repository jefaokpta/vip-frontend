import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RouteService } from '@/pabx/route/route.service';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { TrunkService } from '@/pabx/trunk/trunk.service';
import { RouteTrunk } from '@/pabx/types';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-edit-route-page',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        ReactiveFormsModule,
        RouterLink,
        InputNumber,
        Select,
        TableModule,
        Tag
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar {{ name?.value }}</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/routes"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="block mb-2">Nome *</label>
                    <input id="name" pInputText class="p-inputtext" formControlName="name" />
                    @if (name?.invalid && (name?.dirty || name?.touched)) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Nome é obrigatório.</span>
                        </small>
                    }
                </div>

                <div class="field mb-4">
                    <label for="timeout" class="block mb-2">Tempo limite de discagem *</label>
                    <p-input-number id="timeout" mode="decimal" useGrouping="false" formControlName="timeout" />
                    @if (timeout?.invalid && (timeout?.dirty || timeout?.touched)) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Tempo limite de discagem é obrigatório.</span>
                        </small>
                    }
                </div>

                <div class="field mb-4">
                    <label for="flags" class="block mb-2">Flags de Discagem</label>
                    <input id="flags" pInputText class="p-inputtext" formControlName="flags" />
                </div>

                <p-card>
                    <ng-template #title>
                        <span class="font-semibold text-xl">Ordem dos Troncos</span>
                    </ng-template>

                    <div formArrayName="routeTrunks">
                        <p-table [value]="routeTrunks.controls" [tableStyle]="{ 'min-width': '50rem' }">
                            <ng-template #header>
                                <tr>
                                    <th style="width: 1rem">Código</th>
                                    <th>Tronco 1</th>
                                    <th>Tronco 2</th>
                                    <th>Tronco 3</th>
                                </tr>
                            </ng-template>
                            <ng-template #body let-acc let-index="rowIndex">
                                <tr [formGroupName]="index">
                                    <td>
                                        <p-tag [value]="acc.get('accountCode').value" severity="warn" />
                                    </td>
                                    <td>
                                        <p-select
                                            [options]="trunkOptions"
                                            formControlName="trunk1"
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Selecione um tronco"
                                            appendTo="body"
                                        ></p-select>
                                    </td>
                                    <td>
                                        <p-select
                                            [options]="trunkOptions"
                                            formControlName="trunk2"
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Selecione um tronco"
                                            appendTo="body"
                                        ></p-select>
                                    </td>
                                    <td>
                                        <p-select
                                            [options]="trunkOptions"
                                            formControlName="trunk3"
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Selecione um tronco"
                                            appendTo="body"
                                        ></p-select>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                </p-card>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        @if (pending) {
                            <i class="pi pi-spin pi-spinner"></i>
                        } @else {
                            <i class="pi pi-save"></i>
                        }
                    </p-button>
                </div>

                @if (showError) {
                    <small class="text-red-500"> Erro ao salvar o tronco </small>
                }
            </form>
        </p-card>
    `
})
export class EditRoutePage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    private readonly id: string;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly routeService: RouteService,
        private readonly trunkService: TrunkService,
        private readonly activatedRoute: ActivatedRoute
    ) {
        this.id = this.activatedRoute.snapshot.paramMap.get('id')!;
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            id: [this.id, [Validators.required]],
            companyId: ['', [Validators.required]],
            name: ['', [Validators.required]],
            timeout: [60, [Validators.required]],
            flags: ['T'],
            routeTrunks: this.fb.array([])
        });
        this.routeService.findById(this.id).then((route) => {
            this.form.patchValue(route);
            route.routeTrunks.forEach((routeTrunk) => {
                this.addRouteTrunk(routeTrunk);
            });
        });
        this.trunkService.findAll().then((trunks) => {
            this.trunkOptions = trunks.map((trunk) => ({ label: trunk.name, value: trunk.id }));
        });
    }

    trunkOptions: { label: string; value: number }[] = [];

    private addRouteTrunk(routeTrunk: RouteTrunk) {
        const routeTrunkRow = this.fb.group({
            accountCode: [routeTrunk.accountCode, [Validators.required]],
            trunk1: [routeTrunk.trunk1],
            trunk2: [routeTrunk.trunk2],
            trunk3: [routeTrunk.trunk3]
        });
        this.routeTrunks.push(routeTrunkRow);
    }

    get name() {
        return this.form.get('name');
    }
    get timeout() {
        return this.form.get('timeout');
    }
    get routeTrunks() {
        return this.form.get('routeTrunks') as FormArray;
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        this.routeService
            .update(this.form.value)
            .then(() => this.router.navigate(['/pabx/routes']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
