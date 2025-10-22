import { Routes } from '@angular/router';
import { CallAnalysis } from '@/pages/analysis/call-analysis/call-analysis';
import { CallDetails } from '@/pages/analysis/call-details/call-details';
import { Guidelines } from '@/pages/guidelines';
import { Assistants } from '@/pages/assistants/assistants';
import { NewAssistant } from '@/pages/assistants/new-assistant';
import { EditAssistant } from '@/pages/assistants/edit-assistant';
import { AttendantCallUsersPage } from '@/pages/attendant-call-users.page';
import { UsersPage } from '@/pages/users/users';
import { NewUserPage } from '@/pages/users/new-user';
import { EditUserPage } from '@/pages/users/edit-user';
import { CompaniesPage } from '@/pages/companies/companies';
import { NewCompanyPage } from '@/pages/companies/new-company';
import { EditCompanyPage } from '@/pages/companies/edit-company';
import { PersonPage } from '@/pages/person.page';
import { VoiceAssistantsPage } from '@/pages/voice-assistants/voice-assistants.page';
import { NewVoiceAssistantPage } from '@/pages/voice-assistants/new-voice-assistant.page';
import { EditVoiceAssistantPage } from '@/pages/voice-assistants/edit-voice-assistant.page';
import { IntegrationsPage } from '@/pages/integrations/integrations.page';
import { CarecaPage } from '@/pages/careca/careca-page.component';

export default [
    { path: 'analysis', component: CallAnalysis, data: { breadcrumb: 'Analise de Conversas' } },
    { path: 'analysis/details/:id', component: CallDetails, data: { breadcrumb: 'Analise de Conversas / Detalhes' } },
    { path: 'companies', component: CompaniesPage, data: { breadcrumb: 'Empresas' } },
    { path: 'companies/new', component: NewCompanyPage, data: { breadcrumb: 'Empresas / Criar' } },
    { path: 'companies/edit/:id', component: EditCompanyPage, data: { breadcrumb: 'Empresas / Editar' } },
    { path: 'guidelines', component: Guidelines, data: { breadcrumb: 'Diretrizes da Empresa' } },
    { path: 'assistants', component: Assistants, data: { breadcrumb: 'Assistentes de IA' } },
    { path: 'assistants/new', component: NewAssistant, data: { breadcrumb: 'Assistentes de IA / Criar' } },
    { path: 'assistants/edit/:id', component: EditAssistant, data: { breadcrumb: 'Assistentes de IA / Editar' } },
    { path: 'voice/assistants', component: VoiceAssistantsPage, data: { breadcrumb: 'Assistentes de Voz' } },
    {
        path: 'voice/assistants/new',
        component: NewVoiceAssistantPage,
        data: { breadcrumb: 'Assistentes de Voz / Criar' }
    },
    {
        path: 'voice/assistants/edit/:id',
        component: EditVoiceAssistantPage,
        data: { breadcrumb: 'Assistentes de Voz / Editar' }
    },
    { path: 'attendants', component: AttendantCallUsersPage, data: { breadcrumb: 'Usuários Atendentes' } },
    { path: 'users', component: UsersPage, data: { breadcrumb: 'Usuários' } },
    { path: 'users/new', component: NewUserPage, data: { breadcrumb: 'Usuários / Criar' } },
    { path: 'users/edit/:id', component: EditUserPage, data: { breadcrumb: 'Usuários / Editar' } },
    { path: 'profile', component: PersonPage, data: { breadcrumb: 'Perfil' } },
    { path: 'integrations', component: IntegrationsPage, data: { breadcrumb: 'Integrações com serviços externos' } },
    { path: 'careca', component: CarecaPage, data: { breadcrumb: 'Formulario careca' } },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
