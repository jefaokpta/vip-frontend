import { FormArray, FormBuilder } from '@angular/forms';

/**
 * Teste que comprova o bug no onRowReorder:
 *
 * O PrimeNG reordena o array `actions.controls` ANTES de disparar o evento onRowReorder.
 * Então, ao usar `this.actions.at(event.dragIndex)`, pegamos o controle errado
 * (já trocado), e o removeAt/insert acaba desfazendo a reordenação.
 */
describe('onRowReorder bug', () => {
    let fb: FormBuilder;
    let actions: FormArray;

    beforeEach(() => {
        fb = new FormBuilder();
        actions = fb.array([
            fb.group({ actionEnum: 'ANSWER', arg1: '', arg2: '' }), // index 0: ANSWER
            fb.group({ actionEnum: 'HANGUP', arg1: '', arg2: '' }) // index 1: HANGUP
        ]);
    });

    it('deve demonstrar que a abordagem at/removeAt/insert reverte a reordenação feita pelo PrimeNG', () => {
        // Estado inicial: [ANSWER, HANGUP]
        expect(actions.at(0).value.actionEnum).toBe('ANSWER');
        expect(actions.at(1).value.actionEnum).toBe('HANGUP');

        // Simula o que o PrimeNG faz ANTES de disparar onRowReorder:
        // Move o item do index 1 (HANGUP) para o index 0
        // PrimeNG faz splice no array controls diretamente
        const dragIndex = 1;
        const dropIndex = 0;

        // PrimeNG reordena o array controls in-place (splice)
        const controlsArray = actions.controls;
        const [movedItem] = controlsArray.splice(dragIndex, 1);
        controlsArray.splice(dropIndex, 0, movedItem);

        // Após o PrimeNG reordenar, controls já está [HANGUP, ANSWER]
        expect(controlsArray[0].value.actionEnum).toBe('HANGUP');
        expect(controlsArray[1].value.actionEnum).toBe('ANSWER');

        // Agora executa o onRowReorder com a lógica BUGADA (at/removeAt/insert):
        const event = { dragIndex, dropIndex };
        const control = actions.at(event.dragIndex); // dragIndex=1, mas agora controls[1] é ANSWER (não HANGUP!)
        actions.removeAt(event.dragIndex);
        actions.insert(event.dropIndex, control);

        // BUG: O resultado volta ao estado original [ANSWER, HANGUP] ao invés de [HANGUP, ANSWER]
        // Isso comprova que a lógica está errada
        expect(actions.at(0).value.actionEnum).toBe('ANSWER'); // Deveria ser HANGUP!
        expect(actions.at(1).value.actionEnum).toBe('HANGUP'); // Deveria ser ANSWER!
    });

    it('deve manter a reordenação correta quando onRowReorder não manipula o FormArray', () => {
        // Estado inicial: [ANSWER, HANGUP]
        expect(actions.at(0).value.actionEnum).toBe('ANSWER');
        expect(actions.at(1).value.actionEnum).toBe('HANGUP');

        // Simula o que o PrimeNG faz ANTES de disparar onRowReorder:
        const dragIndex = 1;
        const dropIndex = 0;

        const controlsArray = actions.controls;
        const [movedItem] = controlsArray.splice(dragIndex, 1);
        controlsArray.splice(dropIndex, 0, movedItem);

        // Após o PrimeNG reordenar, controls já está [HANGUP, ANSWER]
        // A correção: NÃO fazer nada no onRowReorder, apenas updateValueAndValidity
        actions.updateValueAndValidity();

        // Agora a ordem está correta: [HANGUP, ANSWER]
        expect(actions.at(0).value.actionEnum).toBe('HANGUP');
        expect(actions.at(1).value.actionEnum).toBe('ANSWER');

        // E o .value também reflete a ordem correta
        expect(actions.value[0].actionEnum).toBe('HANGUP');
        expect(actions.value[1].actionEnum).toBe('ANSWER');
    });
});
