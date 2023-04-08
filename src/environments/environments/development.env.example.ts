import type { EnvironmentType } from '../environment-type';

/**
 * Copy this file and paste it as `development.env.ts`
 * you can then change the settings as you wish
 * - keep in mind to restart the whole building process, because environment files are not watched
 */

// the environment for building the application for development
export const environment: EnvironmentType = {
    production: false,
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
    interceptedConsoleTypes: ['error', 'warn'],
    enableServiceWorker: false,
    enableWss: false,
    showIconTypes: true,
    showPrivacyPolicyWarning: false,
};
