export interface EnvironmentType {
    production: boolean;
    /**
     * Wether new users should be able to register
     */
    registrationRestricted: boolean;
    companyDetails?: {
        email: string;
        phoneNumber: string;
        /**
         * To be used like this:
         * ´´´html
         *  <adress [innerHtml]="adress"></adress>
         * ´´´
         */
        address: string;
        representatives: string;
        commercialRegister: {
            districtCourt: string;
            registerId: string;
        };
        vatIdentificationNumber: string;
    };
    hasCustomerConfig: boolean;
    /**
     * The projectTemplates should be located in
     * assets/project-templates.json
     */
    hasProjectTemplates: boolean;
    allowProjectTemplateCreation: boolean;
    /**
     * The privacyPolicies should be located in
     * assets/privacy-policy/privacy-policy.{{ language }}.html
     */
    hasPrivacyPolicy: boolean;
    /**
     * Wether the shared worker should be enabled (disable for easier debugging of requests)
     */
    sharedWorkerCache: boolean;
    /**
     * The console statements that should be displayed as messages too
     */
    interceptedConsoleTypes: ('error' | 'info' | 'log' | 'warn')[];
    /**
     * Wether to show a legal message warning that the english version is only a preview (because of a missing english privacy-policy)
     */
    showPrivacyPolicyWarning: boolean;
    /**
     * Wether the ServiceWorker should be enabled
     */
    enableServiceWorker: boolean;
    /**
     * Wether it should show the type of icons in html-title-attribute (great for debugging)
     */
    showIconTypes: boolean;
    /**
     * Wether to use `wss` instead of `wss` for the websocket
     */
    enableWss: boolean;
}
