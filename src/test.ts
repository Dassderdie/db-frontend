// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
// See https://github.com/angular/angular/issues/18033
// eslint-disable-next-line import/order
import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { ErrorsManager } from '@core/utility/errors/errors-manager';

declare const require: {
    context: (
        path: string,
        deep?: boolean,
        filter?: RegExp
    ) => {
        keys: () => string[];
        <T>(id: string): T;
    };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/u);
// And load the modules.
context.keys().map(context);

// add the global object for errorHandling
declare global {
    /**
     * The object used for custom error handling
     * - you can use it in any components to easily e.g.
     * throw errors and inform the user / developer about it
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore-error the main.ts file is not included in the test build, but in the main build
    const errors: ErrorsManager;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-var
(window as any).errors = new ErrorsManager();
