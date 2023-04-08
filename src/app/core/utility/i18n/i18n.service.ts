import { Injectable } from '@angular/core';
import type { PessimisticDisplayNameItem } from '@cache-server/api/tables/display-name';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { UsersService } from '../../cache-client/api/users/users.service';
import type { Languages } from './languages';
import { languages } from './languages';

@Injectable({
    providedIn: 'root',
})
export class I18nService {
    /**
     * Emits on subscription and when the used language changes
     */
    private readonly languageChangedE$ = new ReplaySubject<undefined>(1);

    constructor(
        private readonly translateService: TranslateService,
        private readonly usersService: UsersService
    ) {
        // Translation languages
        for (const language of languages) {
            translateService.addLangs([language.id]);
        }

        // Default language
        translateService.setDefaultLang('eng');
        let browserLanguage: string;
        // Parse browser language to ISO 639-2 Code
        switch (translateService.getBrowserLang()) {
            case 'de':
                browserLanguage = 'ger';
                break;
            default:
                browserLanguage = 'eng';
        }
        translateService.onLangChange.subscribe(this.languageChangedE$);
        // eslint-disable-next-line rxjs/no-ignored-observable
        translateService.use(browserLanguage);
        this.usersService
            .getUser()
            .pipe(
                map((user) => user.language),
                filter((lang) => !!lang),
                distinctUntilChanged()
            )
            .subscribe((lang) => translateService.use(lang!));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public get currentLanguageIso639_2(): 'eng' | 'ger' {
        return this.translateService.currentLang as any;
    }
    public get currentLanguageBCP47() {
        switch (this.translateService.currentLang) {
            case 'eng':
                return 'en';
            case 'ger':
                return 'de';
            default:
                errors.error({
                    message: `BCP47 language for ${this.translateService.currentLang} is missing`,
                    status: 'warning',
                });
                return 'en';
        }
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public get languageChangesIso639_2$() {
        return this.languageChangedE$.pipe(
            map(() => this.currentLanguageIso639_2)
        );
    }
    public get languageChangesBCP47$() {
        return this.languageChangedE$.pipe(
            map(() => this.currentLanguageBCP47)
        );
    }

    /**
     * Translates the text
     * @returns the translation of the displayText in the current language or if not available the fallback language
     */
    public getLanguage<
        T extends PessimisticDisplayNameItem | string | null | undefined
    >(displayText: Languages<T>): Exclude<T, undefined> {
        if (!displayText) {
            return null as Exclude<T, undefined>;
        }
        let lang = this.translateService
            .currentLang as keyof Languages<unknown>;
        let translation = displayText[lang];
        if (this.isValidTranslation(translation)) {
            return translation as Exclude<T, undefined>;
        }
        lang = this.translateService.defaultLang as keyof Languages<unknown>;
        translation = displayText[lang];
        if (this.isValidTranslation(translation)) {
            return translation as Exclude<T, undefined>;
        }
        const keys = Object.keys(displayText) as (keyof Languages<unknown>)[];
        if (typeof displayText === 'object' && keys.length > 0) {
            // Take first valid translation
            for (const key of keys) {
                translation = displayText[key];
                if (this.isValidTranslation(translation)) {
                    return translation as Exclude<T, undefined>;
                }
            }
            // Take first translation
            return displayText[keys[0]!] as Exclude<T, undefined>;
        }
        return null as Exclude<T, undefined>;
    }

    private isValidTranslation(
        translation: PessimisticDisplayNameItem | string | null | undefined
    ): boolean {
        if (typeof translation === 'string' || !translation) {
            return !!translation;
        }
        return !!translation.singular;
    }
}
