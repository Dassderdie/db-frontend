import type { IconType } from '@main-shared/icon/icon-type';
import type { Observable } from 'rxjs';

export class BreadcrumbItem {
    constructor(
        public path: string,
        public value$: Observable<string | null | undefined> | undefined,
        public translate: string | undefined,
        public icon: IconType | undefined,
        public significant: boolean = false,
        public titleName?: string
    ) {}
}

export interface BreadcrumbRouteItem {
    /**
     * Wether the information provided by this breadcrumb is necessary to understand on which site one is
     * - mostly intended for the correct displaying of the title
     */
    significant?: boolean;
    value?: ':entry' | ':member' | ':project' | ':table' | 'yourProfile';
    translate?: string;
    icon?: IconType;
    /**
     * A name that wil be used in the title instead of .translate
     */
    titleName?: string;
}
