import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { ErrorsManager } from '@core/utility/errors/errors-manager';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

platformBrowser()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));

// add the global object for errorHandling
declare global {
    /**
     * The object used for custom error handling
     * - you can use it in any components to easily e.g.
     * throw errors and inform the user / developer about it
     */
    const errors: ErrorsManager;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-var
(window as any).errors = new ErrorsManager();
