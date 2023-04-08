import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IconType } from './icon-type';
import { IconsService } from './icons.service';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
    @Input() icon!: IconType;
    /**
     * Wether the icon should be in one line with text
     */
    @Input() inline = true;
    // to use it in template
    public icons: Promise<{
        [key: string]: Icon;
    }> = this.iconsService.icons;

    constructor(private readonly iconsService: IconsService) {}

    public showTitle = !environment.showIconTypes;
}

export interface Icon {
    svg?: string;
    /**
     * shorthand for
     * svg: `<path d="${path}"></path>`
     */
    path?: string;
    text?: string;
    /**
     * Some icons need adjustment (default = '2 2 20 20')
     */
    viewbox?: string;
    spinning?: boolean;
}
