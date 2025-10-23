import {Component, OnInit, ViewChild} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {HttpClientService} from '@/services/http-client.service';
import {Table, TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {ProgressBarModule} from 'primeng/progressbar';
import {TagModule} from 'primeng/tag';
import {Rating} from 'primeng/rating';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Button, ButtonDirective} from 'primeng/button';
import {RouterLink} from '@angular/router';
import {CallAnalyzeStatusEnum, Cdr, RoleEnum, User, UserFieldEnum, WsEvent, WsEventEnum} from '@/types/types';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {ProgressSpinner} from 'primeng/progressspinner';
import {WebphoneService} from '@/webphone/webphone.service';
import {getTemperatureSeverity, sortCdrByDate, telephoneFormat} from '@/util/utils';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {FileUploadModule} from 'primeng/fileupload';
import {environment} from '../../../../environments/environment';
import {UserService} from '@/services/user.service';
import {Badge} from 'primeng/badge';
import {Card} from 'primeng/card';
import {MultiSelect} from 'primeng/multiselect';
import {DatePicker} from 'primeng/datepicker';
import {Dialog} from 'primeng/dialog';
import {isArray} from 'chart.js/helpers';

@Component({
    selector: 'app-call-analysis',
    imports: [
        TableModule,
        InputTextModule,
        ProgressBarModule,
        TagModule,
        DatePipe,
        NgClass,
        Rating,
        FormsModule,
        Button,
        NgIf,
        RouterLink,
        IconField,
        InputIcon,
        ProgressSpinner,
        Toast,
        FileUploadModule,
        Badge,
        Card,
        MultiSelect,
        DatePicker,
        ButtonDirective,
        Dialog,
        NgForOf,
        ReactiveFormsModule
    ],
    providers: [MessageService],
    templateUrl: './call-analysis.html'
})
export class CallAnalysis implements OnInit {
    @ViewChild('dataTable') dt!: Table;
    cdrs: Cdr[] = [];
    user: User;
    loading = true;
    selectedCallerIds: string[] = [];
    callerIdOptions: { label: string; value: string }[] = [];
    selectedTemperatures: any[] = [];
    temperatureOptions: { label: string; value: any }[] = [];
    reportDate?: Date;
    dialogVisible = false;
    reportErrors: string[] = [];
    reportLabel = 'Buscar';
    reportLoading = false;
    protected readonly UserFieldEnum = UserFieldEnum;
    protected readonly CallAnalyzeStatusEnum = CallAnalyzeStatusEnum;
    protected readonly environment = environment;
    protected readonly getTemperatureSeverity = getTemperatureSeverity;
    protected readonly telephoneFormat = telephoneFormat;

    constructor(
        private readonly httpClienteService: HttpClientService,
        private readonly webphoneService: WebphoneService,
        private readonly messageService: MessageService,
        private readonly userService: UserService
    ) {
        this.user = this.userService.getUser();
    }

    ngOnInit(): void {
        this.httpClienteService.findAllCdr().then((cdrs) => {
            this.cdrs = sortCdrByDate(cdrs);
            this.rebuildCallerIdOptions();
            this.loading = false;
        });
    }

    // Exibe apenas o nome quando vier entre aspas, caso contrário retorna o valor original
    clearCallerId(callerId?: string | null): string {
        if (!callerId) return '';
        const match = RegExp(/^"(.*?)"/).exec(callerId);
        if (match) return match[1];
        return callerId;
    }

    dial(telephoneNumber: string) {
        this.webphoneService.makeCall(telephoneNumber);
    }

    onFilterGlobal(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    onUpload(event: any) {
        this.httpClienteService
            .notifyUploadToBackend(this.user.id, event.originalEvent.body.audio)
            .then(() =>
                this.messageService.add({
                    severity: 'info',
                    summary: 'Audio recebido com sucesso',
                    detail: 'Aguarde a análise ser concluída',
                    life: 10_000
                })
            )
            .catch(() =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Desculpe não foi possivel enviar o audio',
                    detail: 'Tente novamente mais tarde.'
                })
            );
    }

    retryAnalyze(cdrId: number, index: number) {
        console.log(cdrId, index);
        this.httpClienteService
            .retryAnalyze(cdrId)
            .then(() => (this.cdrs[index].status = CallAnalyzeStatusEnum.ANALYZING))
            .catch(() =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Desculpe não foi possivel reanalisar',
                    detail: 'Tente novamente mais tarde.',
                    life: 10_000
                })
            );
    }

    rebuildCallerIdOptions(): void {
        // Prepare sets and arrays for unique options
        const seenCaller = new Set<string>();
        const callerOptions: { label: string; value: string }[] = [];
        const seenTemp = new Set<any>();
        const temperatureOptions: { label: string; value: any }[] = [];

        for (const cdr of this.cdrs) {
            // Build callerId options
            const callerValue = cdr.callerId?.toString().trim();
            if (callerValue && !seenCaller.has(callerValue)) {
                seenCaller.add(callerValue);
                callerOptions.push({ label: this.clearCallerId(callerValue), value: callerValue });
            }
            // Build temperature options
            const tempValue = (cdr as any).temperature;
            if (tempValue !== undefined && tempValue !== null && !seenTemp.has(tempValue)) {
                seenTemp.add(tempValue);
                temperatureOptions.push({ label: String(tempValue), value: tempValue });
            }
        }
        const sortByLabel = <T extends { label: any }>(arr: T[]) =>
            arr.sort((a, b) =>
                String(a.label).localeCompare(String(b.label), undefined, { sensitivity: 'base', numeric: true })
            );

        this.callerIdOptions = sortByLabel(callerOptions);
        this.temperatureOptions = sortByLabel(temperatureOptions);
    }

    closeDialog() {
        this.dialogVisible = false;
    }

    executeReport() {
        const m = this.reportDate!.getMonth() + 1;
        const y = this.reportDate!.getFullYear();
        this.reportLoading = true;
        this.httpClienteService.findAllCdrByMonth(this.reportDate!)
            .then((cdrs) => {
                this.cdrs = cdrs;
                this.rebuildCallerIdOptions();
                this.reportLabel = `${m}/${y}`;
                this.dialogVisible = false;
                this.reportDate = undefined;
            })
            .catch((err) => {
                if (isArray(err.error.message)) this.reportErrors = err.error.message;
                else this.reportErrors = [err.error.message];
            })
            .finally(() => this.reportLoading = false);
    }

    private handleWsMessage(event: WsEvent) {
        const isAdmin = this.user.roles.includes(RoleEnum.ADMIN);
        switch (event.type) {
            case WsEventEnum.CDR_NEW: {
                if (!isAdmin && event.cdr!.peer !== this.user.id.toString()) return;
                this.cdrs = sortCdrByDate([...this.cdrs, event.cdr!]);
                break;
            }
            case WsEventEnum.CDR_ANALYSED: {
                const cdrIndex = this.cdrs.findIndex((cdr) => cdr.id === event.callAnalyze!.cdrId);
                if (cdrIndex !== -1) {
                    this.cdrs[cdrIndex] = { ...this.cdrs[cdrIndex], ...event.callAnalyze!.analyze };
                }
                break;
            }
        }
        this.rebuildCallerIdOptions();
    }
}
