import {Component} from '@angular/core';
import {Card} from 'primeng/card';

interface PabxFeature {
    name: string;
    code: string;
    when: string;
    summary: string;
    steps: string[];
    notes: string[];
}

interface FeatureGroup {
    title: string;
    features: PabxFeature[];
}

const DURING_CALL = 'Durante a chamada';
const DIAL_LIKE_A_CALL = 'Disque como uma ligação';

@Component({
    selector: 'p-pabx-features',
    imports: [Card],
    template: `
        <div class="card">
            <h1 class="text-2xl font-semibold mb-2">Facilidades do PABX</h1>
            <p class="text-muted-color m-0">
                Códigos para transferir, estacionar e capturar chamadas em softphones e telefones IP. "Durante a
                chamada" significa digitar no teclado numérico com a ligação em andamento. "Disque como uma ligação"
                significa digitar o código e chamar, como faria com um ramal.
            </p>
        </div>
        @for (group of groups; track group.title) {
            <h2 class="text-xl font-semibold mt-6 mb-4">{{ group.title }}</h2>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                @for (feature of group.features; track feature.name) {
                    <p-card>
                        <div class="flex flex-wrap items-center gap-3 mb-2">
                            <kbd class="px-3 py-1 rounded border border-primary text-primary font-semibold">
                                {{ feature.code }}
                            </kbd>
                            <h3 class="text-lg font-semibold m-0">{{ feature.name }}</h3>
                        </div>
                        <p class="text-sm text-muted-color mb-2">{{ feature.when }}</p>
                        <p class="mb-3">{{ feature.summary }}</p>
                        <ol class="list-decimal pl-5 mb-3">
                            @for (step of feature.steps; track step) {
                                <li class="mb-1">{{ step }}</li>
                            }
                        </ol>
                        <ul class="list-disc pl-5 m-0 text-sm text-muted-color">
                            @for (note of feature.notes; track note) {
                                <li class="mb-1">{{ note }}</li>
                            }
                        </ul>
                    </p-card>
                }
            </div>
        }
    `
})
export class PabxFeaturesPage {
    readonly groups: FeatureGroup[] = [
        {
            title: 'Transferir',
            features: [
                {
                    name: 'Transferência cega',
                    code: '*1',
                    when: DURING_CALL,
                    summary: 'Passa a chamada direto para outro ramal, sem falar antes com quem vai recebê-la.',
                    steps: [
                        'Digite *1 e aguarde o áudio de transferência.',
                        'Digite o ramal de destino.',
                        'A transferência sai cerca de 3 segundos depois do último dígito. Para enviar na hora, digite #.'
                    ],
                    notes: [
                        'Sua ligação é encerrada assim que a transferência é feita.',
                        'Se o destino não atender, a chamada volta a tocar no seu ramal.',
                        'Se o ramal não existir, você ouve um beep e continua na chamada.'
                    ]
                },
                {
                    name: 'Transferência assistida',
                    code: '*2',
                    when: DURING_CALL,
                    summary: 'Fala primeiro com quem vai receber a chamada e só depois passa a ligação.',
                    steps: [
                        'Digite *2 e aguarde o áudio de transferência.',
                        'Digite o ramal de destino e, para não esperar cerca de 3 segundos, digite #. Quem está na chamada fica ouvindo a música de espera.',
                        'Fale com o ramal e desligue para concluir a transferência.'
                    ],
                    notes: [
                        'Se o ramal consultado desligar, você volta a falar com quem estava em espera.',
                        'Se você desligar antes de o ramal atender e ele não atender, a chamada volta para o seu ramal.',
                        'Se o ramal não existir, você ouve um beep e continua na chamada.'
                    ]
                }
            ]
        },
        {
            title: 'Estacionar',
            features: [
                {
                    name: 'Estacionar chamada',
                    code: '*7',
                    when: DURING_CALL,
                    summary: 'Deixa a chamada em espera no PABX para ser retomada de qualquer ramal da empresa.',
                    steps: [
                        'Digite *7. Sua ligação é encerrada e a outra pessoa fica ouvindo a música de espera.',
                        'Avise o colega, informando o seu ramal, ou resgate a chamada você mesmo.'
                    ],
                    notes: ['Se ninguém resgatar em 60 segundos, a chamada volta a tocar no seu ramal.']
                },
                {
                    name: 'Resgatar a sua chamada',
                    code: '*7',
                    when: DIAL_LIKE_A_CALL,
                    summary: 'Retoma a chamada que você mesmo estacionou.',
                    steps: ['Com o telefone livre, disque *7 e chame.'],
                    notes: ['Se não houver chamada estacionada, a ligação é encerrada.']
                },
                {
                    name: 'Resgatar de outro ramal',
                    code: '*7 + ramal',
                    when: DIAL_LIKE_A_CALL,
                    summary: 'Retoma a chamada estacionada por um colega.',
                    steps: ['Disque *7 seguido do ramal que estacionou. Exemplo: *7101 para o ramal 101.'],
                    notes: ['Se esse ramal não tiver chamada estacionada, a ligação é encerrada.']
                }
            ]
        },
        {
            title: 'Capturar',
            features: [
                {
                    name: 'Capturar chamada do grupo',
                    code: '*8',
                    when: DIAL_LIKE_A_CALL,
                    summary: 'Atende no seu ramal uma chamada que está tocando em outro ramal do seu grupo de captura.',
                    steps: ['Quando ouvir outro telefone do grupo tocando, disque *8 e chame.'],
                    notes: [
                        'Se o seu ramal não tiver grupo definido, vale o grupo padrão da empresa.',
                        'Se nenhuma chamada estiver tocando no grupo, a ligação é encerrada.'
                    ]
                },
                {
                    name: 'Capturar chamada de um ramal',
                    code: '*8 + ramal',
                    when: DIAL_LIKE_A_CALL,
                    summary: 'Atende no seu ramal uma chamada que está tocando em um ramal específico.',
                    steps: ['Disque *8 seguido do ramal que está tocando. Exemplo: *8101 para o ramal 101.'],
                    notes: ['Se esse ramal não estiver tocando, a ligação é encerrada.']
                }
            ]
        }
    ];
}
