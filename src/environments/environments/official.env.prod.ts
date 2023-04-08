import type { EnvironmentType } from '../environment-type';
// the environment for building the application for the official website
export const environment: EnvironmentType = {
    production: true,
    registrationRestricted: true,
    companyDetails: {
        email: 'contact@koppadb.com',
        phoneNumber: '+49 (0) 1517 2959696',
        address: `
            <strong> KoppaDb UG(haftungsbeschränkt)</strong><br />
            c/o Universität Potsdam <br />
            August-Bebel-Straße 89 <br />
            Haus 7 <br />
            14482 Potsdam`,
        representatives: 'Julian Schmidt, Simon Meusel',
        commercialRegister: {
            districtCourt: 'Amtsgericht Potsdam',
            registerId: 'HRB 34804',
        },
        vatIdentificationNumber: 'DE338668572',
    },
    hasPrivacyPolicy: true,
    hasCustomerConfig: false,
    allowProjectTemplateCreation: true,
    hasProjectTemplates: true,
    sharedWorkerCache: true,
    interceptedConsoleTypes: ['error'],
    enableServiceWorker: true,
    enableWss: true,
    showIconTypes: false,
    showPrivacyPolicyWarning: true,
};
