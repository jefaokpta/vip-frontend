import {Component, OnInit} from '@angular/core';
import {DatePipe, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ConfirmationService, MessageService, PrimeTemplate} from 'primeng/api';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {Dialog} from 'primeng/dialog';
import {InputText} from 'primeng/inputtext';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Select} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {Toast} from 'primeng/toast';
import {Tooltip} from 'primeng/tooltip';
import {BlockedIpService} from '@/pages/blocked-ip/blocked-ip.service';
import {UserService} from '@/pages/users/user.service';
import {BlockedIp, BlockedIpStatus} from '@/types/blocked-ip';
import {RoleEnum} from '@/types/role-enum';

const IPV4_REGEX = /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/;

@Component({
    selector: 'app-blocked-ip-page',
    standalone: true,
    providers: [ConfirmationService, MessageService],
    imports: [
        Button,
        Card,
        ConfirmDialog,
        DatePipe,
        Dialog,
        FormsModule,
        InputText,
        NgIf,
        PrimeTemplate,
        ProgressSpinner,
        Select,
        TableModule,
        Tag,
        Toast,
        Tooltip
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Controle de IPs
                    </h2>
                    <p-button
                        icon="pi pi-plus"
                        [label]="isSaasSupport ? 'Novo IP' : 'Liberar IP'"
                        (onClick)="openDialog()"
                        outlined
                        rounded
                    />
                </div>
            </ng-template>

            <div class="flex flex-wrap gap-2 mb-4">
                <input pInputText type="text" placeholder="Filtrar IP" [(ngModel)]="filterIp" />
                <input
                    *ngIf="isSaasSupport"
                    pInputText
                    type="text"
                    placeholder="Filtrar empresa"
                    [(ngModel)]="filterCompany"
                />
                <p-select
                    [options]="statusOptions"
                    [(ngModel)]="filterStatus"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Situação"
                    [showClear]="true"
                />
                <p-select
                    [options]="originOptions"
                    [(ngModel)]="filterOrigin"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Origem"
                    [showClear]="true"
                />
            </div>

            <p-table
                [value]="filteredIps"
                [paginator]="true"
                [rows]="15"
                sortField="updatedAt"
                [sortOrder]="-1"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="ip">IP <p-sortIcon field="ip" /></th>
                        <th pSortableColumn="companyId">Empresa <p-sortIcon field="companyId" /></th>
                        <th pSortableColumn="origin">Origem <p-sortIcon field="origin" /></th>
                        <th pSortableColumn="status">Situação <p-sortIcon field="status" /></th>
                        <th pSortableColumn="updatedAt">Data <p-sortIcon field="updatedAt" /></th>
                        <th style="width: 12%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-item>
                    <tr>
                        <td>{{ item.ip }}</td>
                        <td>{{ item.companyId ?? '—' }}</td>
                        <td>{{ item.origin === 'AUTO' ? 'Automático' : 'Manual' }}</td>
                        <td>
                            <p-tag
                                [value]="item.status === 'BLOCKED' ? 'Bloqueado' : 'Liberado'"
                                [severity]="item.status === 'BLOCKED' ? 'danger' : 'success'"
                            />
                        </td>
                        <td>{{ item.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    *ngIf="item.status === 'BLOCKED'"
                                    icon="pi pi-lock-open"
                                    severity="success"
                                    outlined
                                    size="small"
                                    pTooltip="Liberar"
                                    (onClick)="confirmAllow(item)"
                                />
                                <p-button
                                    *ngIf="isSaasSupport && item.status === 'ALLOWED'"
                                    icon="pi pi-lock"
                                    severity="warn"
                                    outlined
                                    size="small"
                                    pTooltip="Bloquear"
                                    (onClick)="confirmBlock(item)"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    outlined
                                    size="small"
                                    pTooltip="Apagar"
                                    (onClick)="confirmDelete(item)"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <p-progress-spinner *ngIf="loading" [style]="{ width: '2rem', height: '2rem' }" />
                    <tr>
                        <td colspan="6" *ngIf="!loading" class="text-center p-4">Nenhum IP encontrado.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>

        <p-dialog
            [header]="isSaasSupport ? 'Novo IP' : 'Liberar IP'"
            [(visible)]="dialogVisible"
            [modal]="true"
            [style]="{ width: '24rem' }"
        >
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label for="ip">IP (IPv4)</label>
                    <input id="ip" pInputText type="text" placeholder="0.0.0.0" [(ngModel)]="newIp" />
                    <small *ngIf="newIp && !isValidIp" class="text-red-500">IP inválido</small>
                </div>
                <div *ngIf="isSaasSupport" class="flex flex-col gap-2">
                    <label for="status">Situação</label>
                    <p-select
                        inputId="status"
                        [options]="statusOptions"
                        [(ngModel)]="newStatus"
                        optionLabel="label"
                        optionValue="value"
                        appendTo="body"
                    />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" severity="secondary" text (onClick)="dialogVisible = false" />
                <p-button label="Salvar" [disabled]="!isValidIp || saving" [loading]="saving" (onClick)="save()" />
            </ng-template>
        </p-dialog>

        <p-confirm-dialog />
        <p-toast />
    `
})
export class BlockedIpPage implements OnInit {
    ips: BlockedIp[] = [];
    loading = true;
    saving = false;
    readonly isSaasSupport: boolean;

    dialogVisible = false;
    newIp = '';
    newStatus: BlockedIpStatus = 'BLOCKED';

    filterIp = '';
    filterCompany = '';
    filterStatus: BlockedIpStatus | null = null;
    filterOrigin: 'MANUAL' | 'AUTO' | null = null;

    readonly statusOptions = [
        { label: 'Bloqueado', value: 'BLOCKED' },
        { label: 'Liberado', value: 'ALLOWED' }
    ];
    readonly originOptions = [
        { label: 'Manual', value: 'MANUAL' },
        { label: 'Automático', value: 'AUTO' }
    ];

    constructor(
        private readonly blockedIpService: BlockedIpService,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        userService: UserService
    ) {
        this.isSaasSupport = userService.getUser().roles.includes(RoleEnum.ROLE_SAAS_SUPPORT);
    }

    ngOnInit(): void {
        this.load();
    }

    get isValidIp(): boolean {
        return IPV4_REGEX.test(this.newIp.trim());
    }

    get filteredIps(): BlockedIp[] {
        const ip = this.filterIp.trim();
        const company = this.filterCompany.trim();
        return this.ips.filter(
            (item) =>
                (!ip || item.ip.includes(ip)) &&
                (!company || (item.companyId ?? '').includes(company)) &&
                (!this.filterStatus || item.status === this.filterStatus) &&
                (!this.filterOrigin || item.origin === this.filterOrigin)
        );
    }

    openDialog() {
        this.newIp = '';
        this.newStatus = 'BLOCKED';
        this.dialogVisible = true;
    }

    save() {
        if (!this.isValidIp) return;
        this.saving = true;
        // Para não-SAAS o status não é enviado (o backend sempre libera)
        const status = this.isSaasSupport ? this.newStatus : undefined;
        this.blockedIpService
            .create(this.newIp.trim(), status)
            .then(() => {
                this.dialogVisible = false;
                return this.load();
            })
            .catch((error) => this.showError(error, 'Erro ao cadastrar o IP'))
            .finally(() => (this.saving = false));
    }

    confirmAllow(item: BlockedIp) {
        this.confirmationService.confirm({
            message: `Liberar ${item.ip}? O IP será desbloqueado imediatamente e não será mais bloqueado automaticamente.`,
            header: 'Confirmação',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: { label: 'Liberar', severity: 'success' },
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            accept: () => this.changeStatus(item, 'ALLOWED')
        });
    }

    confirmBlock(item: BlockedIp) {
        this.confirmationService.confirm({
            message: `Bloquear ${item.ip}? O IP será bloqueado imediatamente.`,
            header: 'Confirmação',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: { label: 'Bloquear', severity: 'danger' },
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            accept: () => this.changeStatus(item, 'BLOCKED')
        });
    }

    confirmDelete(item: BlockedIp) {
        this.confirmationService.confirm({
            message: `Apagar ${item.ip}?`,
            header: 'Confirmação',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: { label: 'Apagar', severity: 'danger' },
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            accept: () =>
                this.blockedIpService
                    .delete(item.id)
                    .then(() => this.load())
                    .catch((error) => this.showError(error, 'Erro ao apagar o IP'))
        });
    }

    private changeStatus(item: BlockedIp, status: BlockedIpStatus) {
        this.blockedIpService
            .updateStatus(item.id, status)
            .then(() => this.load())
            .catch((error) => this.showError(error, 'Erro ao alterar a situação do IP'));
    }

    private load(): Promise<void> {
        return this.blockedIpService
            .findAll()
            .then((ips) => {
                this.ips = ips;
            })
            .catch((error) => this.showError(error, 'Erro ao carregar os IPs'))
            .finally(() => (this.loading = false));
    }

    private showError(error: any, summary: string) {
        this.messageService.add({
            severity: 'error',
            summary,
            detail: error?.error?.message ?? 'Tente novamente mais tarde.',
            life: 15_000
        });
    }
}
