import { Injectable } from '@angular/core';
import type { Icon } from './icon.component';

@Injectable({
    providedIn: 'root',
})
export class IconsService {
    // lazy load all the icons
    public icons: Promise<{
        [key: string]: Icon;
    }> = import('./icons').then((module) => module.icons);
}
