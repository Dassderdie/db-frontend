import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-display-pitch',
    templateUrl: './display-pitch.component.html',
    styleUrls: ['./display-pitch.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayPitchComponent {}
