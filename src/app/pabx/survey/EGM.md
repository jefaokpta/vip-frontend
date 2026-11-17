# pabx/survey

## Overview
CRUD de pesquisas de satisfação por áudio: saudação, até três perguntas e agradecimento, cada uma apontando para um áudio do sistema. Filas podem referenciar uma pesquisa (`Queue.surveyId`).

## Interface
- `SurveyService` (`survey.service.ts`): `findAll()`, `findById(id)`, `create(survey: Partial<Survey>)`, `update(survey)`, `delete(id)`.
- `SurveysPage` (`app-surveys-page`): `countQuestions(survey)`, `confirmDelete(survey)`.
- `NewSurveyPage` (`app-new-survey-page`), `EditSurveyPage` (`app-edit-survey-page`).
- Rotas: `surveys`, `surveys/new`, `surveys/edit/:id`.

## Invariants
- `title`, `greetingAudioId` e `question1AudioId` são obrigatórios; `question2AudioId`, `question3AudioId` e `thankYouAudioId` são opcionais.

## Side Effects
- HTTP: `GET|POST /surveys`, `GET|PUT|DELETE /surveys/{id}`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
