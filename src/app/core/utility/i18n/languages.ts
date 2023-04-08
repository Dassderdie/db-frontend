import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export const languages: Language[] = [
    { id: 'eng', translateKey: _('languages.eng') },
    { id: 'ger', translateKey: _('languages.ger') },
];

export interface Language {
    id: keyof Languages<unknown>;
    translateKey: string;
}

export interface Languages<T> {
    ger?: T;
    eng?: T;
}
