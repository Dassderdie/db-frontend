import type { EnvironmentType } from './environment-type';

// The file contents for the current environment will overwrite these during build.
// The list of which env maps to which file can be found in `.angular.json`.
// The config specified in this file is used during testing and bundle analysis.

export const environment: EnvironmentType = {
    production: true,
    hasCustomerConfig: false,
    registrationRestricted: false,
    hasPrivacyPolicy: false,
    allowProjectTemplateCreation: true,
    hasProjectTemplates: true,
    sharedWorkerCache: true,
    interceptedConsoleTypes: ['error', 'warn'],
    enableServiceWorker: true,
    enableWss: true,
    showIconTypes: false,
    showPrivacyPolicyWarning: true,
};
