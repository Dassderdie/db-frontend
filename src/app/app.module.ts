import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AuthModalModule } from '@core/auth-modal/auth-modal.module';
import { ConfirmationModule } from '@core/utility/confirmation-modal/confirmation.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BreadcrumbModule } from './feature/breadcrumb/breadcrumb.module';
import { FooterModule } from './feature/footer/footer.module';
import { MessagesModule } from './feature/messages/messages.module';
import { NavbarModule } from './feature/navbar/navbar.module';
import { ProgressBarModule } from './feature/progress-bar/progress-bar.module';
import { GlobalLoadingPlaceholderComponent } from './shared/utility/components/global-loading-placeholder/global-loading-placeholder.component';

@NgModule({
    declarations: [AppComponent, GlobalLoadingPlaceholderComponent],
    imports: [
        AuthModalModule,
        BrowserModule,
        BrowserAnimationsModule,
        ConfirmationModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory(http: HttpClient) {
                    return new TranslateHttpLoader(
                        http,
                        'assets/i18n/',
                        '.json'
                    );
                },
                deps: [HttpClient],
            },
        }),
        AppRoutingModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.enableServiceWorker,
            registrationStrategy: 'registerWithDelay:4000',
        }),
        BreadcrumbModule,
        NavbarModule,
        FooterModule,
        MessagesModule,
        ProgressBarModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
