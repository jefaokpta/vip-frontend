import { CallAnalyzeStatusEnum } from '@/types/call-analyze-status-enum';
import { SentimentEnum } from '@/types/sentiment-enum';
import { TemperatureEnum } from '@/types/temperature-enum';
import { UserFieldEnum } from '@/pabx/types/user-field-enum';

export interface Cdr {
    readonly id: number;
    readonly startTime: Date;
    readonly peer: string;
    readonly src: string;
    readonly destination: string;
    readonly callerId: string;
    readonly uniqueId: string;
    readonly disposition: string;
    readonly userfield: UserFieldEnum;
    readonly callRecord: string;
    status: CallAnalyzeStatusEnum;
    title: string;
    readonly summary: string;
    readonly sentiment: SentimentEnum;
    temperature: TemperatureEnum;
    engagement: number;
    readonly mostFrequentWords: string;
    readonly action: string;
    readonly billableSeconds: number;
    readonly cost: number;
    readonly accountCode: string | null;
}
