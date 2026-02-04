import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { NgIf } from '@angular/common';
import { PeerSelectComponent } from '@/pabx/dialplan/components/peer-select-component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-activate-peer-dialog-component',
    standalone: true,
    imports: [Button, Dialog, InputText, NgIf, PeerSelectComponent, ReactiveFormsModule],
    template: `
        <ng-container *ngIf="isPeerFormDialogVisible">
            <p-dialog header="Ative seu ramal" [visible]="true" [modal]="true" [closable]="false">
                <form [formGroup]="form" (ngSubmit)="submit()" class="p-fluid">
                    <div class="field mb-4">
                        <app-peer-select-component formControlName="peer" [isOnlyWSS]="true" [showError]="true" />
                    </div>
                    <div class="field mb-4">
                        <label for="peerSecret" class="block mb-2">Senha *</label>
                        <input id="peerSecret" pInputText class="p-inputtext" formControlName="peerSecret" />
                        <small
                            *ngIf="peerSecret?.invalid && (peerSecret?.dirty || peerSecret?.touched)"
                            class="p-error block mt-2"
                        >
                            <div *ngIf="peerSecret?.errors?.['required']">Senha é obrigatória.</div>
                        </small>
                    </div>
                    <div class="flex justify-end">
                        <p-button label="Salvar" icon="fa fa-save" class="mr-2" [disabled]="form.invalid"></p-button>
                        <p-button label="Cancelar" (click)="closePeerFormDialog()" class="p-button-outlined"></p-button>
                    </div>
                </form>
            </p-dialog>
        </ng-container>
    `
})
export class ActivatePeerDialogComponent implements OnInit {
    form!: FormGroup;
    @Input() isPeerFormDialogVisible = false;
    @Output() isPeerFormDialogVisibleChange = new EventEmitter<boolean>();

    constructor(private readonly fb: FormBuilder) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            peer: ['', [Validators.required]],
            peerSecret: ['', [Validators.required]]
        });
    }

    closePeerFormDialog() {
        if (!this.isPeerFormDialogVisible) {
            return;
        }
        this.isPeerFormDialogVisible = false;
        this.isPeerFormDialogVisibleChange.emit(false);
    }

    submit() {
        console.log(this.form.value);
    }

    get peer() {
        return this.form.get('peer');
    }
    get peerSecret() {
        return this.form.get('peerSecret');
    }
}
