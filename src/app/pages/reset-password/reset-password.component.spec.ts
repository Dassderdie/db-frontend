import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import type { Injector } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { waitForAsync, getTestBed, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/cache-client/api/auth/auth.service';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { MessageService } from '@core/utility/messages/message.service';
import {
    TranslateLoader,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { ValidationModule } from '@shared/inputs/shared/validation/validation.module';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { PasswordResetComponent } from './reset-password.component';

const translations = {
    auth: {
        'reset-password': {
            confirm: 'Confirm password',
            'confirm-placeholder': 'Confirm your password',
            email: {
                description: 'This is the email you used when signing up',
                email: 'Email',
                forgotten:
                    'If you forgot your email address, please contact the support.',
                placeholder: 'Enter your email',
                send: 'Send recovery email',
            },
            heading: 'Reset your password',
            instructions:
                'If you forgot your password, we can send you an recovery email allowing you to choose a new password. Therefore enter the email associated with your account.',
            'new-password': 'Your new Password',
            update: 'Update password',
        },
    },
};

class FakeLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<unknown> {
        return of(translations);
    }
}

describe('ResetPasswordComponent', () => {
    let component: PasswordResetComponent;
    let fixture: ComponentFixture<PasswordResetComponent>;
    let translate: TranslateService;
    let injector: Injector;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [PasswordResetComponent],
                providers: [
                    AuthService,
                    HttpClient,
                    MessageService,
                    RolesService,
                    ProjectsService,
                ],
                imports: [
                    HttpClientModule,
                    CommonModule,
                    ValidationModule,
                    RouterTestingModule.withRoutes([]),
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
        fixture = TestBed.createComponent(PasswordResetComponent);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        component = fixture.componentInstance;
        injector = getTestBed();
        translate = injector.get(TranslateService);
        // eslint-disable-next-line rxjs/no-ignored-observable
        translate.use('en');
        fixture.detectChanges();
    });
});
