import {Component} from '@angular/core';

@Component({
    selector: 'app-peer-page',
    standalone: true,
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Peer Page</div>
            <p>Manage and configure a single peer for your application.</p>
        </div>`
})
export class PeerPage {
}
