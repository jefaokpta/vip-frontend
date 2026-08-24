export interface Survey {
    readonly id: number;
    readonly companyId: string;
    readonly title: string;
    readonly greetingAudioId: number;
    readonly question1AudioId: number;
    readonly question2AudioId?: number;
    readonly question3AudioId?: number;
    readonly thankYouAudioId?: number;
}
