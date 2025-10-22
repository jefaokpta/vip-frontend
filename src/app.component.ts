import { Component, OnInit } from '@angular/core';
import { TitleService } from '@/services/title.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterModule],
    template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
    constructor(private readonly titleService: TitleService) {}

    ngOnInit(): void {
        this.titleService.initializeTitleListener();
    }
}
