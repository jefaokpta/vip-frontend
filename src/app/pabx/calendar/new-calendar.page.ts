import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import { SelectButton } from 'primeng/selectbutton';
import { Calendar, CalendarTypeEnum, DialPlanActionEnum } from '@/pabx/types';
import { CalendarService } from '@/pabx/calendar/calendar.service';
import { calendarTypeOptions, calendarValidateRangeDates, calendarWeekDays } from '@/pabx/calendar/utils';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { PeerActionComponent } from '@/pabx/dialplan/components/peer-action.component';
import { PlaybackActionComponent } from '@/pabx/dialplan/components/playback-action.component';
import { calendarActionOptions } from '@/pabx/dialplan/utils';

@Component({
    selector: 'app-new-calendar-page',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        NgIf,
        ReactiveFormsModule,
        RouterLink,
        DatePicker,
        SelectButton,
        NgForOf,
        RadioButton,
        Select,
        TableModule,
        PeerActionComponent,
        PlaybackActionComponent
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Novo Calendário</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/calendars"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="block mb-2">Nome *</label>
                    <input id="name" pInputText class="p-inputtext" formControlName="name" />
                    <small
                        *ngIf="form.get('name')?.invalid && (form.get('name')?.dirty || form.get('name')?.touched)"
                        class="p-error block mt-2"
                    >
                        Nome é obrigatório.
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="calendarTypeEnum" class="block mb-2">Tipo de Agendamento *</label>
                    <div class="flex gap-4">
                        <div *ngFor="let type of calendarTypes" class="field-checkbox">
                            <p-radiobutton
                                [inputId]="type.label"
                                [value]="type.value"
                                formControlName="calendarTypeEnum"
                                (onClick)="onCalendarTypeChange()"
                            >
                            </p-radiobutton>
                            <label [for]="type.label" class="ml-2">{{ type.label }}</label>
                        </div>
                    </div>
                </div>

                <div
                    *ngIf="form.get('calendarTypeEnum')?.value === CalendarTypeEnum.DATES"
                    class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                >
                    <div class="field">
                        <label for="rangeDates" class="block mb-2">Datas *</label>
                        <p-datepicker
                            id="rangeDates"
                            formControlName="rangeDates"
                            selectionMode="range"
                            [readonlyInput]="true"
                            dateFormat="dd/mm/yy"
                            [showIcon]="true"
                        ></p-datepicker>
                        <small
                            *ngIf="
                                form.get('rangeDates')?.invalid &&
                                (form.get('rangeDates')?.dirty || form.get('rangeDates')?.touched)
                            "
                            class="p-error block mt-2"
                        >
                            Deve ter ao menos 1 data selecionada.
                        </small>
                    </div>
                </div>

                <div *ngIf="form.get('calendarTypeEnum')?.value === CalendarTypeEnum.WEEKDAYS" class="mb-4">
                    <div class="field mb-4">
                        <label for="weekDays" class="block mb-2">Dias da Semana *</label>
                        <p-select-button
                            id="weekDays"
                            [options]="calendarWeekDays"
                            formControlName="weekDays"
                            [multiple]="true"
                            optionLabel="label"
                            optionValue="value"
                        />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="field">
                        <label for="startTime" class="block mb-2">Hora Início *</label>
                        <p-datepicker
                            id="startTime"
                            formControlName="startTime"
                            [timeOnly]="true"
                            [showTime]="true"
                            [showIcon]="true"
                        ></p-datepicker>
                    </div>
                    <div class="field">
                        <label for="endTime" class="block mb-2">Hora Fim *</label>
                        <p-datepicker
                            id="endTime"
                            formControlName="endTime"
                            [timeOnly]="true"
                            [showTime]="true"
                            [showIcon]="true"
                        ></p-datepicker>
                    </div>
                </div>

                <p-card header="Configurar Ações" class="mb-4">
                    <div class="flex gap-4">
                        <div class="field">
                            <p-select
                                id="selectedAction"
                                [options]="actionOptions"
                                formControlName="selectedAction"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione uma ação"
                            ></p-select>
                        </div>
                        <p-button outlined label="Adicionar" icon="pi pi-plus" (onClick)="addAction()"></p-button>
                    </div>

                    <div class="flex flex-col gap-2" formArrayName="actions">
                        <p-table
                            [value]="actions.controls"
                            (onRowReorder)="onRowReorder($event)"
                            [tableStyle]="{ 'min-width': '50rem' }"
                        >
                            <ng-template #header>
                                <tr>
                                    <th style="width: 1rem"></th>
                                    <th></th>
                                    <th style="width: 1rem"></th>
                                </tr>
                            </ng-template>
                            <ng-template #body let-action let-index="rowIndex">
                                <tr [formGroupName]="index" [pReorderableRow]="index">
                                    <td>
                                        <span class="pi pi-bars" pReorderableRowHandle></span>
                                    </td>
                                    <td>
                                        <ng-container *ngIf="action.get('actionEnum').value == 'DIAL_PEER'">
                                            <app-peer-action-component
                                                formControlName="arg1"
                                                (flagsChange)="action.get('arg2').setValue($event)"
                                                [showError]="action.get('arg1').errors?.['required']"
                                            ></app-peer-action-component>
                                        </ng-container>
                                        <ng-container *ngIf="action.get('actionEnum').value == 'PLAYBACK'">
                                            <app-playback-action-component formControlName="arg1" />
                                        </ng-container>
                                    </td>
                                    <td>
                                        <p-button
                                            icon="pi pi-trash"
                                            severity="danger"
                                            outlined
                                            (onClick)="removeAction(index)"
                                        >
                                        </p-button>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                </p-card>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>

                <small *ngIf="showError" class="text-red-500"> Erro ao salvar o calendário </small>
            </form>
        </p-card>
    `
})
export class NewCalendarPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    calendarTypes = calendarTypeOptions;

    calendarWeekDays = calendarWeekDays;

    actionOptions = calendarActionOptions();

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly calendarService: CalendarService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            calendarTypeEnum: [CalendarTypeEnum.WEEKDAYS, [Validators.required]],
            weekDays: [[], [Validators.required, Validators.minLength(1)]],
            startTime: [new Date(new Date().setHours(0, 0, 0, 0)), [Validators.required]],
            endTime: [new Date(new Date().setHours(23, 59, 59, 0)), [Validators.required]],
            selectedAction: [''],
            actions: this.fb.array([], [Validators.required])
        });
    }

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    get selectedAction() {
        return this.form.get('selectedAction');
    }

    get actions() {
        return this.form.get('actions') as FormArray;
    }

    addAction() {
        if (!this.selectedAction?.value) return;
        this.actions.push(
            this.fb.group({
                actionEnum: this.selectedAction?.value,
                arg1: ['', this.actionHasArg1(this.selectedAction?.value)],
                arg2: ['', this.selectedAction.value === DialPlanActionEnum.SET_VARIABLE ? [Validators.required] : []],
                arg3: [''],
                arg4: ['']
            })
        );
    }

    removeAction(index: number) {
        this.actions.removeAt(index);
    }

    onRowReorder(_event: any) {
        this.actions.updateValueAndValidity();
    }

    private actionHasArg1(selectedAction: DialPlanActionEnum): Validators[] {
        if (selectedAction === DialPlanActionEnum.ANSWER || selectedAction === DialPlanActionEnum.HANGUP) return [];
        return [Validators.required];
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        const formValue = this.form.value;
        const calendar: Calendar = {
            companyId: '',
            id: 0,
            name: formValue.name,
            calendarTypeEnum: formValue.calendarTypeEnum,
            rangeDates: calendarValidateRangeDates(formValue.rangeDates),
            weekDays: formValue.weekDays,
            startTime: this.formatTime(formValue.startTime),
            endTime: this.formatTime(formValue.endTime),
            actions: this.actions.value.map((action: any, index: number) => ({ ...action, priority: index }))
        };
        this.calendarService
            .create(calendar)
            .then(() => this.router.navigate(['/pabx/calendars']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }

    get rangeDates() {
        return this.form.get('rangeDates')!;
    }
    get weekDays() {
        return this.form.get('weekDays')!;
    }
    get calendarTypeEnum() {
        return this.form.get('calendarTypeEnum')!;
    }

    protected readonly CalendarTypeEnum = CalendarTypeEnum;

    protected onCalendarTypeChange() {
        if (this.calendarTypeEnum.value === CalendarTypeEnum.DATES) {
            this.form.removeControl('weekDays');
            this.form.addControl('rangeDates', this.fb.control([], [Validators.required, Validators.minLength(1)]));
        } else {
            this.form.removeControl('rangeDates');
            this.form.addControl('weekDays', this.fb.control([], [Validators.required, Validators.minLength(1)]));
        }
    }
}
