import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { RoleEnum } from '@/types/role-enum';
import { User } from '@/types/user';
import { MenuItem } from 'primeng/api';
import { UserService } from '@/pages/users/user.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of filteredModel; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    private readonly model: MenuItem[] = [
        {
            label: 'DASHBOARDS',
            items: [
                {
                    label: 'Painel de Ramais',
                    icon: 'pi pi-fw pi-chart-bar',
                    routerLink: ['']
                },
                {
                    label: 'Painel de Filas',
                    icon: 'pi pi-fw pi-chart-bar',
                    routerLink: ['/pages/queues']
                }
            ]
        },
        {
            label: 'SERVIÇOS',
            items: [
                {
                    label: 'PABX',
                    icon: 'pi pi-fw pi-phone',
                    items: [
                        {
                            label: 'Relatórios',
                            icon: 'pi pi-fw pi-chart-bar',
                            items: [
                                {
                                    label: 'Chamadas',
                                    icon: 'pi pi-fw pi-chart-bar',
                                    routerLink: ['/pabx/call-report']
                                },
                                {
                                    label: 'URA',
                                    roles: [RoleEnum.ROLE_COMPANY_SUPERVISOR],
                                    icon: 'pi pi-fw pi-sitemap',
                                    routerLink: ['/pabx/ura-report']
                                },
                                {
                                    label: 'Pesquisa de Satisfação',
                                    roles: [RoleEnum.ROLE_COMPANY_SUPERVISOR],
                                    icon: 'fa fa-music',
                                    routerLink: ['/pabx/survey-report']
                                },
                                {
                                    label: 'Atividade dos Membros',
                                    roles: [RoleEnum.ROLE_COMPANY_SUPERVISOR],
                                    icon: 'pi pi-fw pi-users',
                                    routerLink: ['/pabx/member-activity-report']
                                },
                                {
                                    label: 'DAC',
                                    icon: 'pi pi-fw pi-image'
                                }
                            ]
                        },
                        {
                            label: 'Ramais',
                            icon: 'pi pi-fw pi-image',
                            routerLink: ['/pabx/peers']
                        },
                        {
                            label: 'Grupos de Captura',
                            icon: 'pi pi-fw pi-users',
                            routerLink: ['/pabx/pickup-groups']
                        },
                        {
                            label: 'Grupos de Chamada',
                            icon: 'pi pi-fw pi-phone',
                            routerLink: ['/pabx/call-groups']
                        },
                        {
                            label: 'Filas de Atendimento',
                            icon: 'pi pi-fw pi-users',
                            routerLink: ['/pabx/queues']
                        },
                        {
                            label: 'Pausas',
                            icon: 'pi pi-fw pi-pause-circle',
                            routerLink: ['/pabx/pauses']
                        },
                        {
                            label: 'Regras de Discagem',
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/pabx/dialplans']
                        },
                        {
                            label: 'Calendários',
                            icon: 'pi pi-fw pi-calendar',
                            routerLink: ['/pabx/calendars']
                        },
                        {
                            label: 'Alias de Discagem',
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/pabx/aliases']
                        },
                        {
                            label: 'DDR',
                            icon: 'pi pi-fw pi-phone',
                            routerLink: ['/pabx/ddrs']
                        },
                        {
                            label: 'Centro de Custo',
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/pabx/accountcodes']
                        },
                        {
                            label: 'Rotas de Chamada',
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/pabx/routes']
                        },
                        {
                            label: 'Troncos',
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/pabx/trunks']
                        },
                        {
                            label: 'Audios do Sistema',
                            icon: 'fa fa-music',
                            routerLink: ['/pabx/mohs']
                        },
                        {
                            label: 'URA',
                            icon: 'fa fa-music',
                            routerLink: ['/pabx/uras']
                        },
                        {
                            label: 'Pesquisa de Satisfação',
                            icon: 'fa fa-music',
                            routerLink: ['/pabx/surveys']
                        },
                        {
                            label: 'Definições Gerais',
                            icon: 'pi pi-fw pi-cog',
                            routerLink: ['/pabx/settings']
                        }
                    ]
                },
                {
                    label: 'Video Conferências',
                    icon: 'pi pi-fw pi-video',
                    items: [
                        {
                            label: 'Salas',
                            icon: 'pi pi-fw pi-image'
                        }
                    ]
                },
                {
                    label: 'Whatsapp',
                    icon: 'pi pi-fw pi-whatsapp',
                    items: [
                        {
                            label: 'Mensagens',
                            icon: 'pi pi-envelope'
                        },
                        {
                            label: 'Registros',
                            icon: 'pi pi-fw pi-image'
                        }
                    ]
                },
                {
                    label: 'LGPD',
                    icon: 'pi pi-fw pi-file',
                    items: [
                        {
                            label: 'Cadastros',
                            icon: 'pi pi-envelope'
                        }
                    ]
                },
                {
                    label: 'CRM',
                    icon: 'pi pi-fw pi-file',
                    items: [
                        {
                            label: 'Clientes',
                            icon: 'pi pi-envelope'
                        }
                    ]
                }
            ]
        },
        {
            label: 'Configurações',
            roles: [RoleEnum.ROLE_COMPANY_ADMIN],
            icon: 'pi pi-fw pi-microchip-ai',
            items: [
                {
                    label: 'Usuários',
                    icon: 'pi pi-fw pi-users',
                    routerLink: ['/pages/users']
                },
                {
                    label: 'Empresas',
                    roles: [RoleEnum.ROLE_COMPANY_ADMIN],
                    icon: 'pi pi-fw pi-building',
                    routerLink: ['/pages/companies']
                },
                {
                    label: 'Integrações',
                    roles: [RoleEnum.ROLE_COMPANY_ADMIN],
                    icon: 'fa fa-puzzle-piece',
                    routerLink: ['/pages/integrations']
                },
                {
                    label: 'Tenants',
                    roles: [RoleEnum.ROLE_SAAS_SUPPORT],
                    icon: 'pi pi-fw pi-sitemap',
                    routerLink: ['/pages/tenants']
                }
            ]
        }
    ];
    filteredModel: MenuItem[] = [];
    private readonly user: User;

    constructor(private readonly userService: UserService) {
        this.user = this.userService.getUser();
    }

    ngOnInit() {
        this.filteredModel = this.filterByRole(this.model);
    }

    /**
     * Filtra uma lista de itens de menu com base nas permissões do usuário atual.
     * Realiza filtragem recursiva em todos os níveis de itens do menu (sem limite de profundidade).
     */
    private filterByRole(items: MenuItem[]): MenuItem[] {
        return items.filter((item) => {
            // Se o item não tem permissão, exclui imediatamente
            if (item['roles'] && !this.hasRole(item['roles'])) {
                return false;
            }

            // Processa os itens filhos recursivamente, se existirem
            if (this.hasSubitems(item)) {
                item.items = this.filterByRole(item.items!);
                // Mantém o item apenas se tiver pelo menos um subitem após filtragem
                return item.items.length > 0;
            }

            return true;
        });
    }

    /**
     * Verifica se um item de menu possui subitens
     */
    private hasSubitems(item: MenuItem): boolean {
        return item.items !== undefined && Array.isArray(item.items);
    }

    /**
     * Verifica se o usuário atual possui pelo menos uma das funções necessárias
     */
    private hasRole(roles: RoleEnum[]): boolean {
        return roles.some((role: RoleEnum) => this.user.roles.includes(role));
    }
}
