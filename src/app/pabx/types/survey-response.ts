export interface SurveyResponse {
    readonly id: number;
    readonly companyId: string;
    readonly surveyId: number;
    readonly callId: string;
    readonly callerId: string;
    readonly question1Answer?: number;
    readonly question2Answer?: number;
    readonly question3Answer?: number;
    readonly createdAt: Date;
}
