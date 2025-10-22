import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { BadgeModule } from 'primeng/badge';
import { LayoutService } from '@/layout/service/layout.service';
import { Card } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { WebphoneService } from '@/webphone/webphone.service';
import { NgClass, NgIf } from '@angular/common';
import { Cdr, User, UserFieldEnum, WsEventEnum } from '@/types/types';
import { HttpClientService } from '@/services/http-client.service';
import { TableModule } from 'primeng/table';
import { sortCdrByDate, telephoneFormat } from '@/util/utils';
import { Subscription } from 'rxjs';
import { WebsocketService } from '@/websocket/websocket.service';
import { handleCalleId } from '@/webphone/utils';
import { UserService } from '@/services/user.service';

@Component({
    selector: 'app-webphone-sidebar',
    imports: [ButtonModule, DrawerModule, BadgeModule, Card, InputTextModule, FormsModule, NgIf, TableModule, NgClass],
    template: `
        <p-drawer
            [visible]="visible()"
            (onHide)="onDrawerHide()"
            position="right"
            [transitionOptions]="'.3s cubic-bezier(0, 0, 0.2, 1)'"
            styleClass="!w-full md:!w-80 lg:!w-[30rem]"
        >
            <p-card class="text-center">
                <ng-template #header>
                    <p class="text-xl font-semibold">Telefone</p>
                </ng-template>
                <div class="mb-2">
                    <p>{{ phoneStatus().state }}</p>
                    <p>{{ telephoneFormat(handleCalleId(phoneStatus().session?.remote_identity?.uri?.user)) }}</p>
                    <p *ngIf="phoneStatus().session">{{ timer }}</p>
                </div>
                <input *ngIf="!phoneStatus().session" type="text" pInputText [(ngModel)]="telephoneNumber" (keydown.enter)="dial()" />
                <div class="flex mt-4 justify-center">
                    <ng-container *ngIf="!phoneStatus().session; else hasSession">
                        <p-button icon="pi pi-phone" severity="success" (click)="dial()" rounded outlined />
                    </ng-container>
                    <ng-template #hasSession>
                        <p-button icon="pi pi-phone" severity="danger" (click)="hangup()" rounded outlined />
                        <p-button class="ml-4" icon="pi pi-calculator" severity="secondary" (click)="toogleDialpad()" rounded outlined />
                        <p-button
                            class="ml-4"
                            icon="pi pi-microphone"
                            severity="danger"
                            (click)="toggleMute()"
                            [label]="phoneStatus().session?.isMuted().audio ? 'mudo' : ''"
                            rounded
                            outlined
                        />
                    </ng-template>
                </div>
                <div *ngIf="dialpadVisible && phoneStatus().session" class="flex flex-col mt-4 items-center transition-colors duration-150">
                    <div class="flex">
                        <p-button (click)="sendDTMF('1')" severity="secondary" rounded outlined>
                            <span class="w-4">1</span>
                        </p-button>
                        <p-button class="ml-4" (click)="sendDTMF('2')" severity="secondary" rounded outlined>
                            <span class="w-4">2</span>
                        </p-button>
                        <p-button class="ml-4" (click)="sendDTMF('3')" severity="secondary" rounded outlined>
                            <span class="w-4">3</span>
                        </p-button>
                    </div>
                    <div class="flex mt-2">
                        <p-button (click)="sendDTMF('4')" severity="secondary" rounded outlined>
                            <span class="w-4">4</span>
                        </p-button>
                        <p-button class="ml-4" (click)="sendDTMF('5')" severity="secondary" rounded outlined>
                            <span class="w-4">5</span>
                        </p-button>
                        <p-button class="ml-4" (click)="sendDTMF('6')" severity="secondary" rounded outlined>
                            <span class="w-4">6</span>
                        </p-button>
                    </div>
                    <div class="flex mt-2">
                        <p-button (click)="sendDTMF('7')" severity="secondary" rounded outlined>
                            <span class="w-4">7</span>
                        </p-button>
                        <p-button class="ml-4" (click)="sendDTMF('8')" severity="secondary" rounded outlined>
                            <span class="w-4">8</span>
                        </p-button>
                        <p-button class="ml-4" (click)="sendDTMF('9')" severity="secondary" rounded outlined>
                            <span class="w-4">9</span>
                        </p-button>
                    </div>
                    <div class="flex mt-2">
                        <p-button (click)="sendDTMF('*')" severity="secondary" rounded outlined>
                            <span class="w-4">*</span>
                        </p-button>
                        <p-button class="ml-4" (click)="sendDTMF('0')" severity="secondary" rounded outlined>
                            <span class="w-4">0</span>
                        </p-button>
                        <p-button class="ml-4" (click)="sendDTMF('#')" severity="secondary" rounded outlined>
                            <span class="w-4">#</span>
                        </p-button>
                    </div>
                </div>
            </p-card>
            <div class="mt-4">
                <p-card>
                    <ng-template #header>
                        <p class="text-center font-semibold">Ligações Recentes</p>
                    </ng-template>
                    <p-table
                        [value]="cdrs"
                        [rows]="10"
                        styleClass="p-datatable-sm"
                        rowHover
                        [scrollable]="true"
                        paginator="true"
                        scrollHeight="300rem"
                        pagelinks="3"
                    >
                        <ng-template pTemplate="body" let-cdr>
                            <tr>
                                <div class="flex items-center gap-2">
                                    <i *ngIf="cdr.userfield === UserFieldEnum.UPLOAD" class="pi pi-upload text-blue-500" title="Upload"></i>
                                    <i
                                        *ngIf="cdr.userfield === UserFieldEnum.OUTBOUND"
                                        class="pi pi-arrow-up"
                                        [ngClass]="{ 'text-green-500': cdr.disposition == 'ANSWERED', 'text-red-500': cdr.disposition != 'ANSWERED' }"
                                        title="Saída"
                                    ></i>
                                    <i
                                        *ngIf="cdr.userfield === UserFieldEnum.INBOUND"
                                        class="pi pi-arrow-down"
                                        [ngClass]="{ 'text-green-500': cdr.disposition == 'ANSWERED', 'text-red-500': cdr.disposition != 'ANSWERED' }"
                                        title="Entrada"
                                    ></i>
                                    <p-button
                                        icon="pi pi-phone"
                                        [label]="telephoneFormat(cdr.destination)"
                                        (click)="dial(cdr.destination)"
                                        [link]="true"
                                        iconPos="right"
                                    />
                                </div>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-card>
            </div>
        </p-drawer>
    `
})
export class WebphoneSidebarComponent implements OnInit, OnDestroy {
    telephoneNumber?: string = undefined;
    dialpadVisible = false;
    cdrs: Cdr[] = [];
    newCdrSubscription: Subscription;
    user: User

    constructor(
        public layoutService: LayoutService,
        private readonly webphoneService: WebphoneService,
        private readonly httpClientService: HttpClientService,
        private readonly websocketService: WebsocketService,
        private readonly userService: UserService
    ) {
        this.user = this.userService.getUser()
        this.newCdrSubscription = this.websocketService.backendEvent().subscribe((event) => {
            if (event.type === WsEventEnum.CDR_NEW && event.cdr!.id === this.user.id){
                this.cdrs = sortCdrByDate(this.deDuplicate([...this.cdrs, event.cdr!]));
            }
        });
    }

    ngOnDestroy(): void {
        this.newCdrSubscription.unsubscribe();
    }

    ngOnInit(): void {
        this.httpClientService.findAllCdr().then((cdrs) => {
            this.cdrs = sortCdrByDate(this.deDuplicate(cdrs))
                .filter(cdr => cdr.peer === this.user.id.toString())
        });
    }

    get phoneStatus() {
        return this.webphoneService.phoneState$;
    }

    get timer() {
        return this.webphoneService.callTimeFormated();
    }

    toogleDialpad() {
        this.dialpadVisible = !this.dialpadVisible;
    }

    dial(telephoneNumber?: string | number) {
        if (telephoneNumber !== undefined && telephoneNumber !== null) {
            this.telephoneNumber = telephoneNumber.toString();
        }
        const digits = this.sanitizePhone(this.telephoneNumber);
        if (!digits) return;
        this.webphoneService.makeCall(digits);
    }

    private sanitizePhone(input?: string): string | undefined {
        if (!input) return undefined;
        const digits = input.replace(/\D/g, '');
        return digits.length ? digits : undefined;
    }

    hangup() {
        this.webphoneService.hangup();
        this.dialpadVisible = false;
    }

    toggleMute() {
        this.webphoneService.toggleMute();
    }

    sendDTMF(digit: string) {
        this.webphoneService.sendDTMF(digit);
    }

    private deDuplicate(cdrs: Cdr[]): Cdr[] {
        const destinations = cdrs
            .filter((cdr) => cdr.userfield === UserFieldEnum.INBOUND || cdr.userfield === UserFieldEnum.OUTBOUND)
            .map((cdr) => cdr.destination);
        const uniqueDestinations = [...new Set(destinations)];
        return uniqueDestinations.map((destination) =>
            cdrs
                .filter((cdr) => cdr.destination === destination)
                .reduce((latest, current) => (new Date(latest.startTime) > new Date(current.startTime) ? latest : current))
        );
    }

    visible = computed(() => this.layoutService.layoutState().webphoneSidebarVisible);

    onDrawerHide() {
        this.layoutService.layoutState.update((state) => ({
            ...state,
            webphoneSidebarVisible: false
        }));
    }

    protected readonly UserFieldEnum = UserFieldEnum;
    protected readonly handleCalleId = handleCalleId;
    protected readonly telephoneFormat = telephoneFormat;
}
