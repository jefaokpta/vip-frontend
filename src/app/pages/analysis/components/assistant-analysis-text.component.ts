/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/29/25
 */
import { Component, Input } from '@angular/core';
import { formattedText } from '@/util/utils';

@Component({
    selector: 'app-assistant-analysis-text',
    standalone: true,
    imports: [],
    template: ` <p class="m-0 whitespace-pre-line" [innerHTML]="formattedText"></p> `
})
export class AssistantAnalysisTextComponent {
    @Input() text: string = '';

    get formattedText() {
        return formattedText(this.text);
    }
}
