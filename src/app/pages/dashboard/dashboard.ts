import {Component, OnInit} from '@angular/core';
import {StatsCardsComponent} from '@/pages/dashboard/components/stats-cards.component';
import {LastAnalysisComponent} from '@/pages/dashboard/components/last-analysis.component';
import {TemperatureComponent} from '@/pages/dashboard/components/temperature.component';
import {HttpClientService} from '@/services/http-client.service';
import {Cdr} from '@/types/types';
import {WebsocketComponent} from "@/pages/dashboard/components/websocket.component";

@Component({
    selector: 'app-components-dashboard',
    standalone: true,
    imports: [StatsCardsComponent, LastAnalysisComponent, TemperatureComponent, WebsocketComponent],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-cards-component [cdrsInput]="cdrs" />
            <div class="col-span-12 xl:col-span-9">
                <app-websocket/>
            </div>
            <div class="col-span-12 xl:col-span-3">
                <app-temperature-component [cdrsInput]="cdrs" />
            </div>
            <div class="col-span-12">
                <app-last-analysis-component [cdrsInput]="cdrs" />
            </div>
        </div>
    `
})
export class Dashboard implements OnInit {
    cdrs: Cdr[] = [];

    constructor(private readonly httpClientService: HttpClientService) {}

    ngOnInit(): void {
    }
}
