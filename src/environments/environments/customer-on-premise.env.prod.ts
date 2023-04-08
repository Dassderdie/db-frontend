import type { EnvironmentType } from '../environment-type';
// the environment for building the application for on premise use
export const environment: EnvironmentType = {
    production: true,
    registrationRestricted: false,
    hasPrivacyPolicy: false,
    hasCustomerConfig: true,
    allowProjectTemplateCreation: true,
    hasProjectTemplates: true,
    sharedWorkerCache: true,
    interceptedConsoleTypes: ['error'],
    enableServiceWorker: true,
    enableWss: true,
    showIconTypes: false,
    showPrivacyPolicyWarning: true,
};
