import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import type { Injector } from '@angular/core';
import { TestBed, getTestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import {
    TranslateLoader,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { ProjectsService } from '../projects/projects.service';
import { RolesService } from '../roles/roles.service';
import { AuthService } from './auth.service';

const translations = {
    messages: {
        auth: {
            timeout: {
                body: 'For security reasons you got logged out automatically. To continue, sign in again.',
                title: 'Your session has timed out!',
            },
        },
    },
};

class FakeLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<unknown> {
        return of(translations);
    }
}

describe('AuthService', () => {
    let translate: TranslateService;
    let injector: Injector;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthService,
                TranslateService,
                RolesService,
                ProjectsService,
                { provide: APP_BASE_HREF, useValue: '/' },
            ],
            imports: [
                HttpClientModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: FakeLoader,
                    },
                }),
                RouterModule.forRoot([]),
            ],
        });
        injector = getTestBed();
        translate = injector.get(TranslateService);
        // eslint-disable-next-line rxjs/no-ignored-observable
        translate.use('en');
    });
});
