import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-collapse-indicator',
    templateUrl: './collapse-indicator.component.html',
    styleUrls: ['./collapse-indicator.component.scss'],
    animations: [
        // Similar to https://github.com/angular/components/blob/master/src/material/expansion/expansion-animations.ts
        trigger('indicatorRotate', [
            state('collapsed, void', style({ transform: 'rotate(0deg)' })),
            state('expanded', style({ transform: 'rotate(180deg)' })),
            transition(
                'expanded <=> collapsed, void => collapsed',
                animate(400)
            ),
        ]),
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapseIndicatorComponent {
    @Input() isExpanded!: boolean;
}
