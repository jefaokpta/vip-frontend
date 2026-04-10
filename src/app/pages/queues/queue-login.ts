import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { QueueState } from '@/pabx/types';
import { QueueLoginService } from '@/pages/queues/queue-login.service';
import { UserService } from '@/pages/users/user.service';
import { WebsocketService } from '@/websocket/stomp/websocket.service';
import { rxStompServiceFactory } from '@/websocket/stomp/rx-stomp-service-factory';

@Component({
    selector: 'app-queue-login',
    providers: [{ provide: WebsocketService, useFactory: rxStompServiceFactory }, MessageService],
    imports: [Card, Button, BadgeModule, Toast],
    template: `
        <p-toast />
        <p-card>
            <ng-template #title>
                <span class="font-semibold text-2xl">Minhas Filas</span>
            </ng-template>

            @if (myQueues().length === 0) {
                <p class="text-surface-500 dark:text-surface-400">Você não é membro de nenhuma fila.</p>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (qs of myQueues(); track qs.queue.id) {
                    <div
                        class="rounded-xl border p-4 flex flex-col gap-3 transition-all duration-300"
                        [class.border-green-500]="isLoggedIn(qs)"
                        [class.border-surface-200]="!isLoggedIn(qs)"
                    >
                        <div class="flex items-center justify-between">
                            <span class="font-semibold text-base">{{ qs.queue.name }}</span>
                            <p-badge
                                [value]="isLoggedIn(qs) ? 'Conectado' : 'Desconectado'"
                                [severity]="isLoggedIn(qs) ? 'success' : 'secondary'"
                            />
                        </div>

                        <div class="flex gap-6 text-sm text-surface-500 dark:text-surface-400">
                            <div class="flex flex-col">
                                <span class="text-xs uppercase tracking-wide">Agentes</span>
                                <span class="font-bold text-surface-700 dark:text-surface-200">{{
                                    qs.loggedMembers.length
                                }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs uppercase tracking-wide">Em Espera</span>
                                <span class="font-bold text-surface-700 dark:text-surface-200">{{
                                    qs.waitingCalls.length
                                }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs uppercase tracking-wide">Membros</span>
                                <span class="font-bold text-surface-700 dark:text-surface-200">{{
                                    qs.queue.memberIds.length
                                }}</span>
                            </div>
                        </div>

                        <p-button
                            [label]="isLoggedIn(qs) ? 'Sair da Fila' : 'Entrar na Fila'"
                            [severity]="isLoggedIn(qs) ? 'danger' : 'success'"
                            [outlined]="!isLoggedIn(qs)"
                            styleClass="w-full"
                            (onClick)="toggleLogin(qs)"
                        />
                    </div>
                }
            </div>
        </p-card>
    `
})
export class QueueLoginPage implements OnInit, OnDestroy {
    readonly myQueues = signal<QueueState[]>([]);
    private userId!: number;
    private companyId!: string;
    private readonly subscriptions: Subscription[] = [];

    constructor(
        private readonly queueLoginService: QueueLoginService,
        private readonly userService: UserService,
        private readonly webSocketService: WebsocketService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        const user = this.userService.getUser();
        this.userId = user.id;
        this.companyId = user.companyId;

        this.loadMyQueues();

        this.subscriptions.push(
            this.webSocketService.watch(`/topic/queuestates/${this.companyId}`).subscribe((message) => {
                const updatedState: QueueState = JSON.parse(message.body);
                this.myQueues.update((queues) =>
                    queues.map((qs) => (qs.queue.id === updatedState.queue.id ? updatedState : qs))
                );
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    isLoggedIn(qs: QueueState): boolean {
        return qs.loggedMembers.some((m) => m.id === this.userId);
    }

    toggleLogin(qs: QueueState): void {
        if (this.isLoggedIn(qs)) {
            this.queueLoginService
                .logout(qs.queue.id)
                .then(() =>
                    this.messageService.add({ severity: 'info', summary: 'Saiu da fila', detail: qs.queue.name })
                )
                .catch(() =>
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Não foi possível sair da fila'
                    })
                );
        } else {
            this.queueLoginService
                .login(qs.queue.id)
                .then(() =>
                    this.messageService.add({ severity: 'success', summary: 'Entrou na fila', detail: qs.queue.name })
                )
                .catch(() =>
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Não foi possível entrar na fila. Verifique se seu ramal WebPhone está configurado.'
                    })
                );
        }
    }

    private loadMyQueues(): void {
        this.queueLoginService.getMyQueues().then((queues) => this.myQueues.set(queues));
    }
}
