import { HttpClientModule } from '@angular/common/http';
import type { Injector } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed, getTestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/cache-client/api/auth/auth.service';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { MessageService } from '@core/utility/messages/message.service';
import { IconModule } from '@main-shared/icon/icon.module';
import {
    TranslateLoader,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { InputsModule } from '@shared/inputs/inputs.module';
import { ValidationComponent } from '@shared/inputs/shared/validation/validation.component';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { AuthModalComponent } from './auth-modal.component';

const translations = {
    auth: {
        'auth-modal': {
            cancel: 'Cancel',
            login: {
                invalid: 'The credentials you entered are invalid!',
                login: 'Login',
                password: {
                    name: 'Password',
                    placeholder: 'Enter your password',
                },
                title: 'Login',
                username: {
                    name: 'Username',
                    placeholder: 'Enter your username',
                },
            },
            'password-lost': 'Forgot your login?',
            register: {
                email: {
                    name: 'Email',
                    placeholder: 'Enter your email',
                },
                name: {
                    name: 'Name',
                    placeholder: 'Enter your name',
                },
                password: {
                    name: 'Password',
                    placeholder: 'Enter your password',
                },
                register: 'Register',
                title: 'Register',
                username: {
                    name: 'Username',
                    placeholder: 'Enter your username',
                },
            },
        },
    },
};

class FakeLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<unknown> {
        return of(translations);
    }
}

describe('AuthModalComponent', () => {
    let component: AuthModalComponent;
    let fixture: ComponentFixture<AuthModalComponent>;
    let translate: TranslateService;
    let injector: Injector;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [AuthModalComponent, ValidationComponent],
                providers: [
                    AuthService,
                    MessageService,
                    RolesService,
                    ProjectsService,
                    BsModalRef,
                ],
                imports: [
                    ModalModule.forRoot(),
                    RouterTestingModule.withRoutes([]),
                    HttpClientModule,
                    InputsModule,
                    IconModule,
                    LoadingButtonModule,
                    TranslateModule.forRoot({
                        loader: {
                            provide: TranslateLoader,
                            useClass: FakeLoader,
                        },
                    }),
                ],
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthModalComponent);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        component = fixture.componentInstance;
        injector = getTestBed();
        translate = injector.get(TranslateService);
        // eslint-disable-next-line rxjs/no-ignored-observable
        translate.use('en');
        fixture.detectChanges();
    });
});
