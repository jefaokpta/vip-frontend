import {Component} from "@angular/core";
import {Message} from "primeng/message";
import {Panel} from "primeng/panel";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
    selector: 'app-answer-action-component',
    imports: [
        Message,
        Panel,
        ReactiveFormsModule
    ],
    template: `
        <p-panel header="Atende Chamada" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <p-message severity="info">Envia sinal de atendimento a chamada</p-message>
            </div>
        </p-panel>
    `
})
export class AnswerActionComponent {
}
