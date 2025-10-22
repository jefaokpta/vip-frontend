import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClientService} from '@/services/http-client.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {TagModule} from 'primeng/tag';
import {ProgressBarModule} from 'primeng/progressbar';
import {Rating} from 'primeng/rating';
import {ChipModule} from 'primeng/chip';
import {CardModule} from 'primeng/card';
import {PanelModule} from 'primeng/panel';
import {DividerModule} from 'primeng/divider';
import {FormsModule} from '@angular/forms';
import {Accordion, AccordionContent, AccordionHeader, AccordionPanel} from 'primeng/accordion';
import {
    Assistant,
    AssistantAnalysis,
    CallLegEnum,
    Cdr,
    Recognition,
    RoleEnum,
    Segment,
    SentimentEnum,
    TemperatureEnum,
    User,
    UserFieldEnum
} from '@/types/types';
import {MessageLegAComponent} from '@/pages/analysis/components/message-leg-a.component';
import {MessageLegBComponent} from '@/pages/analysis/components/message-leg-b.component';
import {ProgressSpinner} from 'primeng/progressspinner';
import {environment} from '../../../../environments/environment';
import {AssistantAnalysisTextComponent} from '@/pages/analysis/components/assistant-analysis-text.component';
import {UserService} from '@/services/user.service';
import {formattedText} from '@/util/utils';

@Component({
    selector: 'app-call-details',
    standalone: true,
    imports: [
        DatePipe,
        TagModule,
        ProgressBarModule,
        Rating,
        ChipModule,
        CardModule,
        PanelModule,
        DividerModule,
        FormsModule,
        Accordion,
        AccordionPanel,
        AccordionHeader,
        AccordionContent,
        NgIf,
        MessageLegAComponent,
        MessageLegBComponent,
        NgForOf,
        ProgressSpinner,
        AssistantAnalysisTextComponent
    ],
    templateUrl: './call-details.html'
})
export class CallDetails implements OnInit {
    readonly user: User;
    cdr?: Cdr;
    recognition?: Recognition;
    assistants: Assistant[] = [];
    assistantAnalysis: AssistantAnalysis[] = [];
    pendingAnalysis = 0;
    callRecordAudioSrc?: string;
    protected readonly CallLegEnum = CallLegEnum;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly httpClientService: HttpClientService,
        private readonly userService: UserService
    ) {
        this.user = this.userService.getUser();
    }

    ngOnInit() {
        const cdrId = this.route.snapshot.paramMap.get('id')!;
        this.httpClientService.findCdrById(cdrId).then((cdr) => {
            this.cdr = cdr;
            this.callRecordAudioSrc = `https://${environment.PABX_URL}/static/mp3s/${this.cdr.callRecord}`;
            this.httpClientService.findRecognitions(cdr.uniqueId).then((recognition) => {
                recognition.segments = this.invertSegmentLegs(cdr.userfield, recognition.segments);
                this.recognition = recognition;
            });
            this.getCallAssistantInsights(cdr);
            this.getAdminAssistantInsights(cdr);
        });
    }

    private getCallAssistantInsights(cdr: Cdr) {
        if (isNaN(Number(cdr.peer))) return // peer pode ser assistant-123456
        this.httpClientService.findAssistants(+cdr.peer)
            .then((assistants) => this.processAssistants(assistants, cdr));
    }

    private getAdminAssistantInsights(cdr: Cdr) {
        if (!this.user.roles.includes(RoleEnum.ADMIN) || cdr.peer === this.user.id.toString()) return
        this.httpClientService.findAssistants(this.user.id)
            .then(assistants => this.processAssistants(assistants, cdr));
    }

    private processAssistants(assistants: Assistant[], cdr: Cdr) {
        assistants.forEach((assistant) => {
            this.assistants.push(assistant);
            this.pendingAnalysis++
            this.getAssistantAnalysis(assistant.id!, cdr.uniqueId, cdr.userfield).then(
                (assistantAnalysis) => {
                    this.assistantAnalysis.push(assistantAnalysis);
                    this.pendingAnalysis--;
                }
            );
        });
    }

    async getAssistantAnalysis(
        assistantId: number,
        uniqueId: string,
        userfield: UserFieldEnum
    ): Promise<AssistantAnalysis> {
        return await this.httpClientService.assistantAnalysis(assistantId, uniqueId, userfield);
    }

    getSentimentSeverity(sentiment?: SentimentEnum) {
        if (!sentiment) return 'info';
        switch (sentiment) {
            case SentimentEnum.POSITIVO:
                return 'success';
            case SentimentEnum.NEUTRO:
                return 'info';
            case SentimentEnum.NEGATIVO:
                return 'danger';
            default:
                return 'info';
        }
    }

    getTemperatureSeverity(temperature?: TemperatureEnum) {
        if (!temperature) return 'info';
        switch (temperature) {
            case TemperatureEnum.QUENTE:
                return 'danger';
            case TemperatureEnum.MORNA:
                return 'warn';
            case TemperatureEnum.FRIA:
                return 'info';
            default:
                return 'info';
        }
    }

    formattedText(text?: string) {
        if (!text) return '';
        return formattedText(text);
    }

    private invertSegmentLegs(userfield: UserFieldEnum, segments: Segment[]) {
        if (userfield === UserFieldEnum.INBOUND) {
            return segments
                .map((segment) => ({
                    ...segment,
                    callLeg: segment.callLeg === CallLegEnum.A ? CallLegEnum.B : CallLegEnum.A
                }))
                .sort((a, b) => a.startSecond - b.startSecond);
        }
        return segments.sort((a, b) => a.startSecond - b.startSecond);
    }
}
