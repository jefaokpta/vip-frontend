import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DialPlanService } from '../dial-plan.service';
import { DialPlan, DialPlanAction, DialPlanActionEnum } from '@/pabx/types';
import { Select } from 'primeng/select';
import { PeerSelectComponent } from '@/pabx/dialplan/components/peer-select-component';
import { AliasSelectComponent } from '@/pabx/dialplan/components/alias-select-component';
import { TrunkSelectComponent } from '@/pabx/dialplan/components/trunk-select-component';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { TableModule } from 'primeng/table';
import { PeerActionComponent } from '@/pabx/dialplan/components/peer-action.component';
import { RouteActionComponent } from '@/pabx/dialplan/components/route-action.component';
import { AnswerActionComponent } from '@/pabx/dialplan/components/answer-action-component';
import { HangupActionComponent } from '@/pabx/dialplan/components/hangup-action-component';
import { PlaybackActionComponent } from '@/pabx/dialplan/components/playback-action.component';
import { VariableActionComponent } from '@/pabx/dialplan/components/variable-action.component';
import { AccountCodeActionComponent } from '@/pabx/dialplan/components/accountcode-action.component';
import { isNumber } from 'chart.js/helpers';
import { dialplanSrcOptions } from '@/pabx/dialplan/utils';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-edit-dialplan-page',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        NgIf,
        ReactiveFormsModule,
        RouterLink,
        Select,
        PeerSelectComponent,
        AliasSelectComponent,
        TrunkSelectComponent,
        ToggleSwitch,
        FormsModule,
        TableModule,
        PeerActionComponent,
        RouteActionComponent,
        AnswerActionComponent,
        HangupActionComponent,
        PlaybackActionComponent,
        VariableActionComponent,
        AccountCodeActionComponent
    ],
    templateUrl: './edit-dialplan.page.html'
})
export class EditDialplanPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    private readonly id: string;

    srcOptions = dialplanSrcOptions();

    actionOptions = [
        { label: 'Atender', value: DialPlanActionEnum.ANSWER },
        { label: 'Desligar', value: DialPlanActionEnum.HANGUP },
        { label: 'Centro de Custo', value: DialPlanActionEnum.ACCOUNT_CODE },
        { label: 'Ramal', value: DialPlanActionEnum.DIAL_PEER },
        { label: 'Rota', value: DialPlanActionEnum.DIAL_ROUTE },
        { label: 'Tocar Audio', value: DialPlanActionEnum.PLAYBACK },
        { label: 'Definir Variável', value: DialPlanActionEnum.SET_VARIABLE }
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly dialPlanService: DialPlanService,
        private readonly activatedRoute: ActivatedRoute
    ) {
        this.id = this.activatedRoute.snapshot.paramMap.get('id')!;
    }

    get name() {
        return this.form.get('name');
    }

    get dst() {
        return this.form.get('dst');
    }

    get srcEnum() {
        return this.form.get('srcEnum');
    }

    get srcValue() {
        return this.form.get('srcValue');
    }

    get dstAlias() {
        return this.form.get('dstAlias');
    }

    get dstToggle() {
        return this.form.get('dstToggle');
    }

    get selectedAction() {
        return this.form.get('selectedAction');
    }

    get actions() {
        return this.form.get('actions') as FormArray;
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            id: [this.id, [Validators.required]],
            companyId: ['', [Validators.required]],
            name: ['', [Validators.required]],
            srcEnum: ['', [Validators.required]],
            dst: ['', [Validators.required]],
            isAlwaysActive: [true],
            isActive: [true],
            dstToggle: [false],
            selectedAction: [''],
            actions: this.fb.array([], [Validators.required])
        });
        this.dialPlanService.findById(this.id).then((dialplan) => {
            this.form.patchValue(dialplan);
            this.manageSrcValue(dialplan);
            this.manageDstValue(dialplan);
            this.loadActions(dialplan.actions);
        });
    }

    manageSrcValue(dialplan?: DialPlan) {
        this.form.removeControl('srcValue');
        if (this.srcEnum?.value != 'ANY') {
            this.form.addControl(
                'srcValue',
                this.fb.control(dialplan?.srcValue ? dialplan.srcValue : '', [Validators.required])
            );
        }
    }

    private loadActions(actions: DialPlanAction[]) {
        actions
            .sort((a, b) => a.priority - b.priority)
            .forEach((action) => {
                this.actions.push(
                    this.fb.group({
                        actionEnum: action.actionEnum,
                        arg1: [action.arg1, this.actionHasArg1(action.actionEnum)],
                        arg2: [
                            action.arg2,
                            action.actionEnum === DialPlanActionEnum.SET_VARIABLE ? [Validators.required] : []
                        ]
                    })
                );
            });
    }

    addAction() {
        if (!this.selectedAction?.value) return;
        this.actions.push(
            this.fb.group({
                actionEnum: this.selectedAction?.value,
                arg1: ['', this.actionHasArg1(this.selectedAction?.value)],
                arg2: ['', this.selectedAction.value === DialPlanActionEnum.SET_VARIABLE ? [Validators.required] : []]
            })
        );
    }

    removeDialplanAction(index: number) {
        this.actions.removeAt(index);
    }

    onRowReorder(_event: any) {
        this.actions.updateValueAndValidity();
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        const dialplan = this.form.value;
        dialplan.actions = this.actions.value.map((action: any, index: any) => ({ ...action, priority: index }));
        this.dialPlanService
            .update(dialplan)
            .then(() => this.router.navigate(['/pabx/dialplans']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }

    private manageDstValue(dialplan: DialPlan) {
        if (isNumber(dialplan.dstAlias)) {
            this.form.removeControl('dst');
            this.form.addControl('dstAlias', this.fb.control(dialplan.dstAlias.toString(), [Validators.required]));
            this.dstToggle?.setValue(true);
        } else {
            this.form.removeControl('dstAlias');
            this.form.addControl('dst', this.fb.control(dialplan.dst, [Validators.required]));
        }
    }

    protected toggleDstAlias(event: any) {
        if (event.checked) {
            this.form.removeControl('dst');
            this.form.addControl('dstAlias', this.fb.control('', [Validators.required]));
        } else {
            this.form.removeControl('dstAlias');
            this.form.addControl('dst', this.fb.control('', [Validators.required]));
        }
    }

    private actionHasArg1(selectedAction: DialPlanActionEnum): Validators[] {
        if (selectedAction === DialPlanActionEnum.ANSWER || selectedAction === DialPlanActionEnum.HANGUP) return [];
        return [Validators.required];
    }
}
