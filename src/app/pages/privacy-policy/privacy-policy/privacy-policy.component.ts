import type { OnDestroy, OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { baseUrl } from '@cache-server/http-handler/default-base-url';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-privacy-policy',
    templateUrl: './privacy-policy.component.html',
    styleUrls: ['./privacy-policy.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicyComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    constructor(
        private readonly i18nService: I18nService,
        private readonly domSanitizer: DomSanitizer
    ) {
        super();
    }

    public privacyPolicy$!: Observable<string>;

    ngOnInit(): void {
        this.privacyPolicy$ = this.i18nService.languageChangesIso639_2$.pipe(
            switchMap(async (language) =>
                fetch(
                    `${baseUrl}/assets/privacy-policy/privacy-policy.${language}.html`
                ).then(async (response) => response.text())
            ),
            map(
                (privacyPolicy) =>
                    this.domSanitizer.bypassSecurityTrustHtml(
                        privacyPolicy
                    ) as string
            )
        );
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
