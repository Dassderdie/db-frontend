import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Addon } from './addon';

@Component({
    selector: 'app-addon',
    templateUrl: './addon.component.html',
    styleUrls: ['./addon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddonComponent {
    @Input() addon!: Addon;
}
