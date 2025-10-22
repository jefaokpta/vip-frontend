import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-message-leg-b',
    standalone: true,
    imports: [],
    template: `
        <div class="mt-4 text-right">
            <span class="inline-block text-left border bg-primary-100 text-primary-900 p-2 whitespace-normal rounded" style="word-break: break-word; max-width:80%;">
                <p class="font-medium">Cliente:</p>
                {{ text }}
                <div class="text-right text-sm text-gray-400">{{ time }}s</div>
            </span>
        </div>
    `
})
export class MessageLegBComponent {
    @Input() time: number = 0;
    @Input() text: string = '';
}
