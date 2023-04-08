import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
    selector: 'app-display-foreign-divider',
    templateUrl: './display-foreign-divider.component.html',
    styleUrls: ['./display-foreign-divider.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayForeignDividerComponent {
    @Input() last!: boolean;
    @Input() numberOfTotalRelations!: number;
    @Input() displayLimit!: number;
}
