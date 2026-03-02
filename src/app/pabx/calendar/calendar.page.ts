import { Component, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { CalendarService } from '@/pabx/calendar/calendar.service';
import { RouterLink } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Calendar, CalendarTypeEnum, WeekDayEnum } from '@/pabx/types';
import { NgIf } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { Badge } from 'primeng/badge';
import { calendarWeekDays } from '@/pabx/calendar/utils';

@Component({
    selector: 'app-calendar-page',
    standalone: true,
    providers: [ConfirmationService, MessageService],
    imports: [
        Card,
        IconField,
        InputIcon,
        InputText,
        Button,
        TableModule,
        RouterLink,
        ProgressSpinner,
        ConfirmDialog,
        Toast,
        NgIf,
        Tooltip,
        Badge
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Calendários
                    </h2>
                    <div class="inline-flex items-center">
                        <p-iconfield>
                            <p-inputicon class="pi pi-search" />
                            <input
                                pInputText
                                type="text"
                                (input)="onFilterGlobal($event)"
                                placeholder="Pesquisar"
                                [style]="{ borderRadius: '2rem' }"
                                class="w-full"
                            />
                        </p-iconfield>
                        <p-button icon="pi pi-plus" label="Calendário" routerLink="new" outlined class="mx-4" rounded />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="calendars"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['name', 'calendarType']"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">
                            Nome
                            <p-sortIcon field="name"></p-sortIcon>
                        </th>
                        <th>Datas</th>
                        <th>Horários</th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-calendar>
                    <tr>
                        <td>{{ calendar.name }}</td>
                        <td>
                            @if (calendar.calendarTypeEnum == CalendarTypeEnum.WEEKDAYS) {
                                @if (isOnlyWorkDays(calendar.weekDays)) {
                                    <span>Seg a Sex</span>
                                } @else if (wholeWeek(calendar.weekDays)) {
                                    <span>Semana Inteira</span>
                                } @else {
                                    <div class="flex gap-1">
                                        @for (weekday of calendar.weekDays; track weekday) {
                                            <p-badge [value]="weekdayByEnum(weekday)" severity="secondary"></p-badge>
                                        }
                                    </div>
                                }
                            } @else {
                                {{ formatRangeDates(calendar.rangeDates) }}
                            }
                        </td>
                        <td>
                            @if (
                                calendar.startTime.toString().substring(0, 5) == '00:00' &&
                                calendar.endTime.toString().substring(0, 5) == '23:59'
                            ) {
                                <p-badge value="24h" />
                            } @else {
                                <p-badge [value]="calendar.startTime.toString().substring(0, 5)" />
                                <p-badge [value]="calendar.endTime.toString().substring(0, 5)" severity="secondary" />
                            }
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', calendar.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    (click)="confirmDelete(calendar)"
                                    outlined
                                    size="small"
                                    pTooltip="Remover"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <p-progress-spinner *ngIf="loading" [style]="{ width: '2rem', height: '2rem' }" />
                    <tr>
                        <td colspan="8" *ngIf="!loading" class="text-center p-4">Nenhum calendário encontrado.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog />
        <p-toast />
    `
})
export class CalendarPage implements OnInit {
    calendars: Calendar[] = [];
    @ViewChild('dataTable') dt!: Table;
    loading = true;

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly calendarService: CalendarService
    ) {}

    ngOnInit(): void {
        this.calendarService.findAll().then((calendars) => {
            this.calendars = calendars;
            this.loading = false;
        });
    }

    weekdayByEnum(weekdayEnum: WeekDayEnum): string {
        return calendarWeekDays.find((weekday) => weekday.value === weekdayEnum)?.label || '';
    }

    formatRangeDates(dates?: Date[]): string {
        if (!dates || dates.length === 0) return '';
        return dates
            .map((d) => {
                const date = new Date(d);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                return `${day}/${month}`;
            })
            .join(' a ');
    }

    isOnlyWorkDays(weekDays: WeekDayEnum[]): boolean {
        return (
            weekDays.length === 5 &&
            weekDays.every((weekday) =>
                [
                    WeekDayEnum.MONDAY,
                    WeekDayEnum.TUESDAY,
                    WeekDayEnum.WEDNESDAY,
                    WeekDayEnum.THURSDAY,
                    WeekDayEnum.FRIDAY
                ].includes(weekday)
            )
        );
    }

    wholeWeek(weekDays: WeekDayEnum[]): boolean {
        return (
            weekDays.length === 7 &&
            weekDays.every((weekday) =>
                [
                    WeekDayEnum.MONDAY,
                    WeekDayEnum.TUESDAY,
                    WeekDayEnum.WEDNESDAY,
                    WeekDayEnum.THURSDAY,
                    WeekDayEnum.FRIDAY,
                    WeekDayEnum.SATURDAY,
                    WeekDayEnum.SUNDAY
                ].includes(weekday)
            )
        );
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    confirmDelete(calendar: Calendar) {
        this.confirmationService.confirm({
            message: `Deletar ${calendar.name}?`,
            header: 'Confirmação',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {
                label: 'Deletar',
                severity: 'danger'
            },
            rejectButtonProps: {
                label: 'Fechar',
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                this.calendarService
                    .delete(calendar.id)
                    .then(() => {
                        this.calendars = this.calendars.filter((c) => c.id !== calendar.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Calendário removido com sucesso',
                            life: 15_000
                        });
                    })
                    .catch(() => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Desculpe não foi possível remover o calendário',
                            detail: 'Tente novamente mais tarde.',
                            life: 15_000
                        });
                    });
            }
        });
    }

    protected readonly CalendarTypeEnum = CalendarTypeEnum;
}
