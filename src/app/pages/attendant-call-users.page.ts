import { Component, OnInit } from '@angular/core';
import { PickList } from 'primeng/picklist';
import { HttpClientService } from '@/services/http-client.service';
import { Attendant, AttendantTypeEnum, Company, User } from '@/types/types';
import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { UserService } from '@/services/user.service';
import { Divider } from 'primeng/divider';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { telephoneFormat } from '@/util/utils';

@Component({
    selector: 'app-attendant-call-users-page',
    standalone: true,
    imports: [PickList, Button, Toast, PrimeTemplate, Divider, Select, FormsModule],
    providers: [MessageService],
    template: `
        <div class="card">
            <div class="flex justify-between content-center">
                <div>
                    <div class="font-semibold text-xl mb-4">Usuários atendentes</div>
                    <p>Usuários chamados ao receber uma ligação</p>
                </div>
                <div>
                    <p-select
                        [options]="company?.phones"
                        optionLabel="phone"
                        optionValue="phone"
                        placeholder="Selecione o DDR"
                        [(ngModel)]="selectedPhone"
                        (onChange)="onChangeDDR()"
                        class="w-full md:w-auto"
                    >
                        <ng-template #selectedItem let-selectedOption>
                            {{ telephoneFormat(selectedOption.phone) }}
                        </ng-template>
                        <ng-template let-item #item>
                            {{ telephoneFormat(item.phone) }}
                        </ng-template>
                    </p-select>
                </div>
            </div>

            <div class="mt-4">
                <p-pick-list
                    [source]="availableUsers"
                    [target]="targetAttendants"
                    [dragdrop]="true"
                    [responsive]="true"
                    [sourceStyle]="{ height: '30rem' }"
                    [targetStyle]="{ height: '30rem' }"
                    [showSourceControls]="false"
                    [showTargetControls]="false"
                    breakpoint="1200px"
                >
                    <ng-template pTemplate="sourceHeader">
                        <p-divider>Disponíveis</p-divider>
                    </ng-template>
                    <ng-template pTemplate="targetHeader">
                        <p-divider>Selecionados</p-divider>
                    </ng-template>
                    <ng-template let-item #item>
                        <i class="fas fa-user mr-2"></i>
                        {{ item.name }}
                    </ng-template>
                </p-pick-list>
            </div>

            <div class="mt-4">
                <p-button label="Salvar" icon="pi pi-save" (click)="onSave()" class="mt-4" />
            </div>

            <p-toast></p-toast>
        </div>`
})
export class AttendantCallUsersPage implements OnInit {
    availableUsers: User[] = [];
    targetAttendants: any[] = [];
    user: User;
    private users?: User[];
    company?: Company;
    selectedPhone?: string

    constructor(
        private readonly httpClientService: HttpClientService,
        private readonly messageService: MessageService,
        private readonly userService: UserService
    ) {
        this.user = this.userService.getUser();
    }

    ngOnInit(): void {
        this.httpClientService.findAllUsers().then((users) => {
            this.users = users;
            this.buildAvailableOptions();
            this.httpClientService.findOneCompanyByControlNumber(this.user.controlNumber).then((company) => {
                this.company = company;
                this.selectedPhone = this.company?.phones[0]?.phone;
                this.buildTargetOptions();
            });
        });
    }

    buildAvailableOptions() {
        if (this.users) {
            this.availableUsers = this.users.filter((user) => user.roles.length > 1);
        }
    }

    buildTargetOptions() {
        const selectedDDR = this.company?.phones.find(p => p.phone === this.selectedPhone)
        if (!selectedDDR) throw new Error('Nenhum telefone encontrado para o DDR selecionado.');
        this.targetAttendants = (selectedDDR.attendants as any) ?? [];
        this.cleanupUserAlreadySelected();
    }

    cleanupUserAlreadySelected() {
        const targetIds = this.targetAttendants.map((target) => target.attendantId);
        this.availableUsers = this.availableUsers.filter((user) => !targetIds.includes(user.id));
    }

    onChangeDDR() {
        this.buildAvailableOptions()
        this.buildTargetOptions();
    }

    onSave() {
        const attendants: Attendant[] = this.targetAttendants.map((target) => {
            if (target.attendantId) return target;
            return {
                attendantId: +target.id,
                name: target.name,
                attendantTypeEnum: target.attendantTypeEnum ?? AttendantTypeEnum.USER
            };
        });
        this.httpClientService
            .updateCompanyAttendants({ attendants }, this.selectedPhone!)
            .then(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Usuários atualizados com sucesso!',
                    life: 15000
                });
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Não foi possível salvar',
                    detail: 'Tente novamente',
                    life: 15000
                });
            });
    }

    protected readonly telephoneFormat = telephoneFormat;
}
