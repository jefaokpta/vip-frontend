import { Component, inject, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FluidModule } from 'primeng/fluid';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-careca-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        CheckboxModule,
        RadioButtonModule,
        SelectButtonModule,
        AutoCompleteModule,
        FluidModule,
        SelectModule,
        TextareaModule,
        ReactiveFormsModule
    ],
    templateUrl: './careca-page.component.html',
    styleUrl: './careca-page.component.css'
})
export class CarecaPage implements OnInit {
    sectorValues = [
        { sector: 'Comércio', code: 2 },
        { sector: 'Governo', code: 4 },
        { sector: 'Indústria', code: 1 },
        { sector: 'Serviços', code: 3 },
        { sector: 'Terceiro Setor', code: 5 }
    ];

    vipServerValues = [
        { server: 'CallCenter', code: '023' },
        { server: 'IPBCenter', code: '016' },
        { server: 'IPBX', code: '046' }
    ];

    states = [
        { sigla: 'AC', nome: 'Acre' },
        { sigla: 'AL', nome: 'Alagoas' },
        { sigla: 'AP', nome: 'Amapá' },
        { sigla: 'AM', nome: 'Amazonas' },
        { sigla: 'BA', nome: 'Bahia' },
        { sigla: 'CE', nome: 'Ceará' },
        { sigla: 'DF', nome: 'Distrito Federal' },
        { sigla: 'ES', nome: 'Espírito Santo' },
        { sigla: 'GO', nome: 'Goiás' },
        { sigla: 'MA', nome: 'Maranhão' },
        { sigla: 'MT', nome: 'Mato Grosso' },
        { sigla: 'MS', nome: 'Mato Grosso do Sul' },
        { sigla: 'MG', nome: 'Minas Gerais' },
        { sigla: 'PA', nome: 'Pará' },
        { sigla: 'PB', nome: 'Paraíba' },
        { sigla: 'PR', nome: 'Paraná' },
        { sigla: 'PE', nome: 'Pernambuco' },
        { sigla: 'PI', nome: 'Piauí' },
        { sigla: 'RJ', nome: 'Rio de Janeiro' },
        { sigla: 'RN', nome: 'Rio Grande do Norte' },
        { sigla: 'RS', nome: 'Rio Grande do Sul' },
        { sigla: 'RO', nome: 'Rondônia' },
        { sigla: 'RR', nome: 'Roraima' },
        { sigla: 'SC', nome: 'Santa Catarina' },
        { sigla: 'SP', nome: 'São Paulo' },
        { sigla: 'SE', nome: 'Sergipe' },
        { sigla: 'TO', nome: 'Tocantins' }
    ];

    alltimeValue: any = null;
    audioWorktimeValue: any = null;
    biningRouteValue: any = null;
    companySizeValue: any = null;
    devicePeerValue: any = null;
    financialValidationValue: any = null;
    franchiseTypeValue: any = null;
    modalityValue: any = null;
    planValue: any = null;
    paymentTypeValue: any = null;
    preferContactValue: any = null;
    providedEquipmentValue: any = null;
    queueAcivedValue: any = null;
    setupValue: any = null;
    statusValue: any = null;
    targetCallsValue: any = null;
    techProfileValue: any = null;
    typeProjectValue: any = null;
    uraActivedValue: any = null;
    uraTypeValue: any = null;
    whatsappNumberTypeValue: any = null;
    whatsappTelephoneValue: any = null;
    wipActivedValue: any = null;

    fb = inject(FormBuilder);
    // cepService = inject(CepService);
    isLoading = false;

    ngOnInit(): void {
        this.setupCepValidation();
        this.handleConditionalValidation();
    }

    formCompany = this.fb.group({
        name: ['', Validators.required],
        aliasName: ['', Validators.required],
        cnpj: ['', [Validators.required]],
        sector: ['', Validators.required],
        segment: ['', Validators.required],
        server: ['', Validators.required],
        zipcode: [
            '',
            {
                validators: [Validators.required],
                asyncValidators: [],
                updateOn: 'blur'
            }
        ],
        address: ['', Validators.required],
        number: ['', Validators.required],
        district: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        statusValue: ['', [Validators.required]],
        typeProject: ['', [Validators.required]],
        companySize: ['', [Validators.required]],
        sourceClient: ['', [Validators.required]],
        techProfile: ['', [Validators.required]],
        financialValidation: ['', [Validators.required]],
        modality: ['', [Validators.required]],
        contractualPeriod: ['', [Validators.required]],
        dateContract: ['', [Validators.required]],
        responsibleContract: ['', [Validators.required]],
        seller: ['', [Validators.required]],
        financialMail: ['', [Validators.required, Validators.email]],
        preferContact: ['', [Validators.required]],
        contactName: ['', [Validators.required]],
        contactEmail: ['', [Validators.required, Validators.email]],
        contactPhone: ['', [Validators.required]],
        contactPosition: ['', [Validators.required]],
        contactDepartment: ['', [Validators.required]],
        plan: ['', [Validators.required]],
        franchiseType: ['', [Validators.required]],
        integrationCRM: ['', [Validators.required]],
        wipActived: ['', [Validators.required]],
        wipVersion: [''],
        totalPeers: ['', [Validators.required]],
        peerPrice: ['', [Validators.required]],
        totalPeersValue: ['', [Validators.required]],
        mobilePeers: ['', [Validators.required]],
        licenseWip: ['', [Validators.required]],
        virtualNumbers: ['', [Validators.required]],
        portedNumbers: ['', [Validators.required]],
        newNumber: ['', [Validators.required]],
        numberValue: ['', [Validators.required]],
        nationalSingleNumber: ['', [Validators.required]],
        simultaneousChannels: ['', [Validators.required]],
        rangePeers: ['', [Validators.required]],
        devicePeer: ['', [Validators.required]],
        biningRoute: ['', [Validators.required]],
        brasilFix: ['', [Validators.required]],
        brasilMobile: ['', [Validators.required]],
        ddi: ['', [Validators.required]],
        n0800: ['', [Validators.required]],
        n0300: ['', [Validators.required]],
        cadence: ['', [Validators.required]],
        uraActived: ['', [Validators.required]],
        uraType: ['', [Validators.required]],
        audioWorktime: ['', [Validators.required]],
        daysHours: ['', [Validators.required]],
        alltime: ['', [Validators.required]],
        queueActived: ['', [Validators.required]],
        targetCalls: ['', [Validators.required]],
        whatsappTelephone: ['', [Validators.required]],
        whatsappNumberType: ['', [Validators.required]],
        providedEquipment: ['', [Validators.required]],
        totalEquipment: ['', [Validators.required]],
        equipmentValue: ['', [Validators.required]],
        deliveryAddress: ['', [Validators.required]],
        setup: ['', [Validators.required]],
        setupPrice: ['', [Validators.required]],
        paymentType: ['', [Validators.required]],
        sendTicketDate: ['', [Validators.required]],
        totalContracted: ['', [Validators.required]]
    });

    get name() {
        return this.formCompany.get('name');
    }

    get aliasName() {
        return this.formCompany.get('aliasName');
    }

    get cnpj() {
        return this.formCompany.get('cnpj');
    }

    get sector() {
        return this.formCompany.get('sector');
    }

    get segment() {
        return this.formCompany.get('segment');
    }

    get server() {
        return this.formCompany.get('server');
    }

    get zipcode(): AbstractControl | null {
        return this.formCompany.get('zipcode');
    }

    get address(): AbstractControl | null {
        return this.formCompany.get('address');
    }

    get number(): AbstractControl | null {
        return this.formCompany.get('number');
    }

    get complement() {
        return this.formCompany.get('complement');
    }

    get district(): AbstractControl | null {
        return this.formCompany.get('district');
    }

    get city(): AbstractControl | null {
        return this.formCompany.get('city');
    }

    get state(): AbstractControl | null {
        return this.formCompany.get('state');
    }

    get typeProject() {
        return this.formCompany.get('typeProject');
    }

    get companySize() {
        return this.formCompany.get('companySize');
    }

    get wipVersion() {
        return this.formCompany.get('wipVersion');
    }

    get wipActived() {
        return this.formCompany.get('wipActived');
    }

    get integrationCRM() {
        return this.formCompany.get('integrationCRM');
    }

    get franchiseType() {
        return this.formCompany.get('franchiseType');
    }

    get plan() {
        return this.formCompany.get('plan');
    }

    get contactDepartment() {
        return this.formCompany.get('contactDepartment');
    }

    get contactPosition() {
        return this.formCompany.get('contactPosition');
    }

    get contactPhone() {
        return this.formCompany.get('contactPhone');
    }

    get contactEmail() {
        return this.formCompany.get('contactEmail');
    }

    get contactName() {
        return this.formCompany.get('contactName');
    }

    get preferContact() {
        return this.formCompany.get('preferContact');
    }

    get financialMail() {
        return this.formCompany.get('financialMail');
    }

    get seller() {
        return this.formCompany.get('seller');
    }

    get responsibleContract() {
        return this.formCompany.get('responsibleContract');
    }

    get dateContract() {
        return this.formCompany.get('dateContract');
    }

    get contractualPeriod() {
        return this.formCompany.get('contractualPeriod');
    }

    get modality() {
        return this.formCompany.get('modality');
    }

    get financialValidation() {
        return this.formCompany.get('financialValidation');
    }

    get techProfile() {
        return this.formCompany.get('techProfile');
    }

    get sourceClient() {
        return this.formCompany.get('sourceClient');
    }

    get totalPeers() {
        return this.formCompany.get('totalPeers');
    }

    get peerPrice() {
        return this.formCompany.get('peerPrice');
    }

    get totalPeersValue() {
        return this.formCompany.get('totalPeersValue');
    }

    get mobilePeers() {
        return this.formCompany.get('mobilePeers');
    }

    get licenseWip() {
        return this.formCompany.get('licenseWip');
    }

    get virtualNumbers() {
        return this.formCompany.get('virtualNumbers');
    }

    get portedNumbers() {
        return this.formCompany.get('portedNumbers');
    }

    get newNumber() {
        return this.formCompany.get('newNumber');
    }

    get numberValue() {
        return this.formCompany.get('numberValue');
    }

    get nationalSingleNumber() {
        return this.formCompany.get('nationalSingleNumber');
    }

    get simultaneousChannels() {
        return this.formCompany.get('simultaneousChannels');
    }

    get rangePeers() {
        return this.formCompany.get('rangePeers');
    }

    get devicePeer() {
        return this.formCompany.get('devicePeer');
    }

    get biningRoute() {
        return this.formCompany.get('biningRoute');
    }

    get brasilFix() {
        return this.formCompany.get('brasilFix');
    }

    get brasilMobile() {
        return this.formCompany.get('brasilMobile');
    }

    get ddi() {
        return this.formCompany.get('ddi');
    }

    get n0800() {
        return this.formCompany.get('n0800');
    }

    get n0300() {
        return this.formCompany.get('n0300');
    }

    get cadence() {
        return this.formCompany.get('cadence');
    }

    get uraActived() {
        return this.formCompany.get('uraActived');
    }

    get uraType() {
        return this.formCompany.get('uraType');
    }

    get audioWorktime() {
        return this.formCompany.get('audioWorktime');
    }

    get daysHours() {
        return this.formCompany.get('daysHours');
    }

    get alltime() {
        return this.formCompany.get('alltime');
    }

    get queueActived() {
        return this.formCompany.get('queueActived');
    }

    get targetCalls() {
        return this.formCompany.get('targetCalls');
    }

    get whatsappTelephone() {
        return this.formCompany.get('whatsappTelephone');
    }

    get whatsappNumberType() {
        return this.formCompany.get('whatsappNumberType');
    }

    get providedEquipment() {
        return this.formCompany.get('providedEquipment');
    }

    get totalEquipment() {
        return this.formCompany.get('totalEquipment');
    }

    get equipmentValue() {
        return this.formCompany.get('equipmentValue');
    }

    get deliveryAddress() {
        return this.formCompany.get('deliveryAddress');
    }

    get setup() {
        return this.formCompany.get('setup');
    }

    get setupPrice() {
        return this.formCompany.get('setupPrice');
    }

    get paymentType() {
        return this.formCompany.get('paymentType');
    }

    get sendTicketDate() {
        return this.formCompany.get('sendTicketDate');
    }

    get totalContracted() {
        return this.formCompany.get('totalContracted');
    }

    setupCepValidation(): void {
        const cepControl = this.formCompany.get('zipcode');

        if (cepControl) {
            cepControl.valueChanges.subscribe((cep) => {
                const cleanCep = cep?.replace(/\D/g, '') || '';

                // Auto-complete do hífen
                if (cleanCep.length === 8 && !cleanCep.includes('-')) {
                    const formattedCep = `${cleanCep.substring(0, 5)}-${cleanCep.substring(5)}`;
                    cepControl.setValue(formattedCep, { emitEvent: false });
                }

                // Consulta automática do CEP quando estiver completo
                if (cleanCep.length === 8) {
                    // Força a validação antes de consultar
                    cepControl.markAsTouched();

                    // Pequeno delay para garantir que a validação assíncrona tenha tempo de executar
                    setTimeout(() => {
                        if (cepControl.valid && !cepControl.pending) {
                            this.searchAddress(cleanCep);
                        }
                    }, 100);
                }
            });

            // Também escuta mudanças no status de validação
            cepControl.statusChanges.subscribe((status) => {
                if (status === 'VALID' && cepControl.value) {
                    const cleanCep = cepControl.value.replace(/\D/g, '');
                    if (cleanCep.length === 8 && !this.isLoading) {
                        this.searchAddress(cleanCep);
                    }
                }
            });
        }
    }

    searchAddress(cep: string): void {
        this.isLoading = true;

        // this.cepService.searchCep(cep).subscribe({
        //     next: (address) => {
        //         this.isLoading = false;
        //
        //         if (address) {
        //             this.populateAddressFields(address);
        //         }
        //     },
        //     error: () => {
        //         this.isLoading = false;
        //     }
        // });
    }

    // populateAddressFields(address: Address): void {
    //     this.formCompany.patchValue({
    //         address: address.logradouro || '',
    //         district: address.bairro || '',
    //         city: address.localidade || '',
    //         state: address.uf || ''
    //     });
    //
    //     // Mantém o foco no campo número após preencher automaticamente
    //     const numeroControl = this.formCompany.get('number');
    //     if (numeroControl) {
    //         setTimeout(() => {
    //             const numeroInput = document.getElementById('number');
    //             if (numeroInput) {
    //                 numeroInput.focus();
    //             }
    //         }, 100);
    //     }
    // }

    handleConditionalValidation() {
        const wipActived = this.formCompany.get('wipActived');
        const wipVersion = this.formCompany.get('wipVersion');

        if (wipActived && wipVersion) {
            wipActived.valueChanges.pipe(distinctUntilChanged()).subscribe((actived) => {
                if (actived === 'yes') {
                    wipVersion.setValidators([Validators.required]);
                }
                if (actived === 'no') {
                    wipVersion.clearValidators();
                }
                wipVersion.updateValueAndValidity();
            });
        }
    }

    submit() {
        if (this.formCompany.invalid) {
            this.formCompany.markAllAsTouched();
            return;
        }
        console.log(this.formCompany.value);
    }
}
