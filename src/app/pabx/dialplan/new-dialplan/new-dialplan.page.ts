import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {DialPlanService} from '../dial-plan.service';
import {DialPlan, DialPlanActionEnum, SrcEnum} from "@/pabx/types";
import {Select} from "primeng/select";
import {AgentSelectComponent} from "@/pabx/dialplan/components/agent-select-component";
import {PeerSelectComponent} from "@/pabx/dialplan/components/peer-select-component";
import {AliasSelectComponent} from "@/pabx/dialplan/components/alias-select-component";
import {TrunkSelectComponent} from "@/pabx/dialplan/components/trunk-select-component";
import {ToggleSwitch} from "primeng/toggleswitch";
import {TableModule} from "primeng/table";
import {PeerActionComponent} from "@/pabx/dialplan/components/peer-action.component";
import {RouteActionComponent} from "@/pabx/dialplan/components/route-action.component";
import {AgentActionComponent} from "@/pabx/dialplan/components/agent-action.component";
import {AnswerActionComponent} from "@/pabx/dialplan/components/answer-action-component";
import {HangupActionComponent} from "@/pabx/dialplan/components/hangup-action-component";
import {PlaybackActionComponent} from "@/pabx/dialplan/components/playback-action.component";
import {VariableActionComponent} from "@/pabx/dialplan/components/variable-action.component";

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-new-dialplan-page',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        NgIf,
        ReactiveFormsModule,
        RouterLink,
        Select,
        AgentSelectComponent,
        PeerSelectComponent,
        AliasSelectComponent,
        TrunkSelectComponent,
        ToggleSwitch,
        FormsModule,
        TableModule,
        PeerActionComponent,
        RouteActionComponent,
        AgentActionComponent,
        AnswerActionComponent,
        HangupActionComponent,
        PlaybackActionComponent,
        VariableActionComponent
    ],
    templateUrl: './new-dialplan.page.html',
})
export class NewDialplanPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    srcOptions = [
        {label: 'Qualquer', value: SrcEnum.ANY},
        {label: 'Ramal', value: SrcEnum.PEER},
        {label: 'Agente', value: SrcEnum.AGENT},
        {label: 'Expressão Regular', value: SrcEnum.EXPRESSION},
        {label: 'Alias', value: SrcEnum.ALIAS},
        {label: 'Tronco', value: SrcEnum.TRUNK},
    ];

    actionOptions = [
        {label: 'Atender', value: DialPlanActionEnum.ANSWER},
        {label: 'Desligar', value: DialPlanActionEnum.HANGUP},
        {label: 'Centro de Custo', value: DialPlanActionEnum.ACCOUNT_CODE},
        {label: 'Ramal', value: DialPlanActionEnum.DIAL_PEER},
        {label: 'Agente', value: DialPlanActionEnum.DIAL_AGENT},
        {label: 'Rota', value: DialPlanActionEnum.DIAL_ROUTE},
        {label: 'Tocar Audio', value: DialPlanActionEnum.PLAYBACK},
        {label: 'Definir Variável', value: DialPlanActionEnum.SET_VARIABLE},
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly dialPlanService: DialPlanService
    ) {
    }

    get name() {
        return this.form.get('name');
    }

    get dst() {
        return this.form.get('dst');
    }

    get src() {
        return this.form.get('src');
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

    get dialplanActions() {
        return this.form.get('dialplanActions') as FormArray;
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            src: ['', [Validators.required]],
            dst: ['', [Validators.required]],
            isAlwaysActive: [true],
            isActive: [true],
            dstToggle: [false],
            selectedAction: [''],
            dialplanActions: this.fb.array([]),
        });
    }

    manageSrcValue() {
        this.form.removeControl('srcValue');
        if (this.src?.value != 'ANY') {
            this.form.addControl('srcValue', this.fb.control('', [Validators.required]));
        }
    }

    addDialplanAction() {
        if (!this.selectedAction?.value) return
        this.dialplanActions.push(this.fb.group({
            dialPlanActionEnum: this.selectedAction?.value,
            arg1: ['', [Validators.required]],
            arg2: ['', this.selectedAction.value === DialPlanActionEnum.SET_VARIABLE ? [Validators.required] : []],
        }));
    }

    removeDialplanAction(index: number) {
        this.dialplanActions.removeAt(index);
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        const dialplan: DialPlan = {
            ...this.form.value,
        };
        console.log(dialplan);
        // this.dialPlanService.create(dialplan)
        //     .then(() => this.router.navigate(['/pabx/dialplans']))
        //     .catch(() => {
        //         this.showError = true;
        //     })
        //     .finally(() => (this.pending = false));
    }

    protected isDstUsingAlias(event: any) {
        if (event.checked) {
            this.form.removeControl('dst');
            this.form.addControl('dstAlias', this.fb.control('', [Validators.required]));
        } else {
            this.form.removeControl('dstAlias');
            this.form.addControl('dst', this.fb.control('', [Validators.required]));
        }
    }

}
