import type { Languages } from '@core/utility/i18n/languages';

export const changelogs: {
    /**
     * The release-date of this version (also used to determine wether the release-notes should be shown on e.g. the Home-screen)
     */
    releaseDate: string;
    /**
     * the version that is also used in package.json
     */
    version: string;
    /**
     * the relative paths from 'assets/changelogs/' on
     * this can also be empty/not all languages must have a changelog
     * -> you can add any html and can depend on global styles from e.g. bootstrap
     */
    paths: Languages<string>;
}[] = [
    {
        version: '0.5.0',
        releaseDate: 'Oct 26 2021',
        paths: {
            ger: '0/0.5/0.5.0.ger.html',
        },
    },
    {
        version: '0.4.0',
        releaseDate: 'Feb 15 2021',
        paths: {
            ger: '0/0.4/0.4.0.ger.html',
        },
    },
    {
        version: '0.3.0',
        releaseDate: 'Aug 26 2020',
        paths: {
            ger: '0/0.3/0.3.0.ger.html',
        },
    },
    {
        version: '0.2.0',
        releaseDate: 'Dec 18 2019',
        paths: {
            ger: '0/0.2/0.2.0.ger.html',
        },
    },
];
