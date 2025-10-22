import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-message-leg-a',
    template: `
        <div class="mt-4">
            <span
                class="text-surface-700 dark:text-surface-100 inline-block border p-2 whitespace-normal rounded"
                style="word-break: break-word; max-width:80%;"
            >
                <p class="font-medium">Usuário:</p>
                {{ text }}
                <div class="text-right text-sm text-gray-400">{{ time }}s</div>
            </span>
        </div>
    `
})
export class MessageLegAComponent {
    @Input() time: number = 0;
    @Input() text: string = '';
}
