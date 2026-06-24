import { CodecEnum } from '@/pabx/types/codec-enum';
import { DtmfModeEnum } from '@/pabx/types/dtmf-mode-enum';
import { ExtraConfig } from '@/pabx/types/extra-config';
import { LanguageEnum } from '@/pabx/types/language-enum';
import { TechnologyEnum } from '@/pabx/types/technology-enum';

export interface Trunk {
    readonly id: number;
    readonly companyId: string;
    readonly name: string;
    readonly username: string;
    readonly secret: string;
    readonly host: string;
    readonly port: number;
    readonly peerQualify: boolean;
    readonly callLimit: number;
    readonly language: LanguageEnum;
    readonly dtmfMode: DtmfModeEnum;
    readonly technology: TechnologyEnum;
    readonly codecs: CodecEnum[];
    readonly techPrefix: string;
    readonly extraConfigs: ExtraConfig[];
}
