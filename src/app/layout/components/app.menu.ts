import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { RoleEnum, User } from '@/types/types';
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
                                    icon: 'pi pi-fw pi-chart-bar'
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
            roles: ['ROLE_ADMIN', 'ROLE_SUPER'],
            icon: 'pi pi-fw pi-microchip-ai',
            items: [
                {
                    label: 'Usuários',
                    icon: 'pi pi-fw pi-users',
                    routerLink: ['/pages/users']
                },
                {
                    label: 'Empresas',
                    roles: ['ROLE_SUPER'],
                    icon: 'pi pi-fw pi-building',
                    routerLink: ['/pages/companies']
                },
                {
                    label: 'Integrações',
                    roles: ['ROLE_ADMIN'],
                    icon: 'fa fa-puzzle-piece',
                    routerLink: ['/pages/integrations']
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
        this.filteredModel = this.filterModel();
    }

    /**
     * Filtra o modelo de menu com base nas permissões do usuário atual.
     * Realiza filtragem recursiva em todos os níveis de itens do menu.
     */
    private filterModel(): MenuItem[] {
        return this.model.filter((item) => {
            // Se o item não tem permissão, exclui imediatamente
            if (item['roles'] && !this.hasRole(item['roles'])) {
                return false;
            }

            // Processa os itens filhos, se existirem
            if (this.hasSubitems(item)) {
                // Filtra itens de primeiro nível
                item.items = this.filterByRole(item.items!);

                // Filtra itens de segundo nível
                this.filterByRoleLevel2(item);
            }

            // Mantém o item se não tiver subitens ou se tiver pelo menos um subitem após filtragem
            return !this.hasSubitems(item) || item.items!.length > 0;
        });
    }

    /**
     * Processa e filtra os subitens de segundo nível
     */
    private filterByRoleLevel2(item: MenuItem): void {
        item.items = item.items?.map((subItem) => {
            if (this.hasSubitems(subItem)) {
                subItem.items = this.filterByRole(subItem.items!);
            }
            return subItem;
        });
    }

    /**
     * Verifica se um item de menu possui subitens
     */
    private hasSubitems(item: MenuItem): boolean {
        return item.items !== undefined && Array.isArray(item.items);
    }

    /**
     * Filtra uma lista de itens de menu com base nas permissões
     */
    private filterByRole(items: MenuItem[]): MenuItem[] {
        return items.filter((item) => !item['roles'] || this.hasRole(item['roles']));
    }

    /**
     * Verifica se o usuário atual possui pelo menos uma das funções necessárias
     */
    private hasRole(roles: RoleEnum[]): boolean {
        return roles.some((role: RoleEnum) => this.user.roles.includes(role));
    }
}
