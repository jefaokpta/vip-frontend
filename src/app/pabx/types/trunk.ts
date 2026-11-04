import {CodecEnum} from '@/pabx/types/codec-enum';
import {DtmfModeEnum} from '@/pabx/types/dtmf-mode-enum';
import {ExtraConfig} from '@/pabx/types/extra-config';
import {LanguageEnum} from '@/pabx/types/language-enum';
import {TechnologyEnum} from '@/pabx/types/technology-enum';

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
    readonly extraConfigs: ExtraConfig[];
}

/** Visão mínima do tronco (GET /trunks/options), acessível a COMPANY_ADMIN. */
export type TrunkOption = Pick<Trunk, 'id' | 'name'>;
