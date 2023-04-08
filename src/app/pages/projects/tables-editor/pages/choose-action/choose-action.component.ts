import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-choose-action',
    templateUrl: './choose-action.component.html',
    styleUrls: ['./choose-action.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseActionComponent {}
