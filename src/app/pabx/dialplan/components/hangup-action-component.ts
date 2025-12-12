import {Component} from "@angular/core";
import {Message} from "primeng/message";
import {Panel} from "primeng/panel";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
    selector: 'app-hangup-action-component',
    imports: [
        Message,
        Panel,
        ReactiveFormsModule
    ],
    template: `
        <p-panel header="Desliga Chamada" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <p-message severity="info">Desconecta a chamada atual</p-message>
            </div>
        </p-panel>
    `
})
export class HangupActionComponent {
}
