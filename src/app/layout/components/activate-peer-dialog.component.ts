import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { NgIf } from '@angular/common';
import { PeerSelectComponent } from '@/pabx/dialplan/components/peer-select-component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Password } from 'primeng/password';
import { UserService } from '@/pages/users/user.service';
import { Message } from 'primeng/message';

@Component({
    selector: 'app-activate-peer-dialog-component',
    standalone: true,
    imports: [Button, Dialog, NgIf, PeerSelectComponent, ReactiveFormsModule, Password, Message],
    template: `
        <ng-container *ngIf="isPeerFormDialogVisible">
            <p-dialog header="Ative seu ramal" [visible]="true" [modal]="true" [closable]="false">
                <form [formGroup]="form" (submit)="onSubmit()" class="p-fluid">
                    <div class="field mb-4">
                        <app-peer-select-component formControlName="peer" [isOnlyWSS]="true" [showError]="true" />
                    </div>
                    <div class="field mb-4">
                        <label for="peerSecret" class="block mb-2">Senha *</label>
                        <p-password formControlName="peerSecret" [toggleMask]="true" feedback="false" />
                        <small
                            *ngIf="peerSecret?.invalid && (peerSecret?.dirty || peerSecret?.touched)"
                            class="p-error block mt-2"
                        >
                            <div *ngIf="peerSecret?.errors?.['required']">Senha é obrigatória.</div>
                        </small>
                    </div>
                    <div class="flex justify-end">
                        <p-button
                            label="Salvar"
                            type="submit"
                            icon="fa fa-save"
                            class="mr-2"
                            [disabled]="form.invalid"
                        ></p-button>
                        <p-button label="Cancelar" (click)="closePeerFormDialog()" class="p-button-outlined"></p-button>
                    </div>
                    @if (errorMessages) {
                        <div class="mt-2">
                            <p-message size="small" severity="error" text="{{ errorMessages }}"></p-message>
                        </div>
                    }
                </form>
            </p-dialog>
        </ng-container>
    `
})
export class ActivatePeerDialogComponent implements OnInit {
    form!: FormGroup;
    @Input() isPeerFormDialogVisible = false;
    @Output() isPeerFormDialogVisibleChange = new EventEmitter<boolean>();
    errorMessages?: string = undefined;

    constructor(
        private readonly fb: FormBuilder,
        private readonly usersService: UserService
    ) {}

    ngOnInit(): void {
        this.errorMessages = undefined;
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

    onSubmit() {
        this.usersService
            .updateWebphoneRegistration(this.form.value)
            .then(() => {
                this.closePeerFormDialog();
            })
            .catch((e) => {
                this.errorMessages = e.error.message;
            });
    }

    get peerSecret() {
        return this.form.get('peerSecret');
    }
}
