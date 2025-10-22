/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 14/07/2025
 */
import { Component } from '@angular/core';
import { Card } from 'primeng/card';
import { PipedriveComponent } from '@/pages/integrations/pipedrive.component';
import { GoogleCalendarComponent } from '@/pages/integrations/google-calendar.component';

@Component({
    selector: 'app-integrations-page',
    imports: [Card, GoogleCalendarComponent, GoogleCalendarComponent, PipedriveComponent],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Integrações
                    </h2>
                </div>
            </ng-template>

            <div class="grid grid-cols-12 gap-4 mt-8">
                <div class="col-span-12 md:col-span-4 mb-8">
                    <app-google-calendar-component />
                </div>
                <div class="col-span-12 md:col-span-4 mb-8">
                    <app-pipedrive-component />
                </div>
            </div>

        </p-card>
    `
})
export class IntegrationsPage {}
