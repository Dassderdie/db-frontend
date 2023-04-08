import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import type { IconType } from '@main-shared/icon/icon-type';
import { AnonymousService } from '@tables/core/anonymous.service';
import type { Observable } from 'rxjs';

@Component({
    selector: 'app-anonymous-button',
    templateUrl: './anonymous-button.component.html',
    styleUrls: ['./anonymous-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnonymousButtonComponent {
    @Input() allowAnonymous = false;
    @Input() name!: string;
    @Input() title = '';
    @Input() newEvent$?: Observable<unknown> | Promise<unknown>;
    @Input() type: 'danger' | 'primary' | 'secondary' | 'success' | 'warning' =
        'warning';
    /**
     * force the input to be disabled/enabled (null -> while loading disabled)
     */
    @Input() disabled: boolean | null = null;
    @Input() timeout = 500;
    @Input() small = false;
    @Input() icons: ReadonlyArray<IconType> = [];
    /**
     * Emits when button is clicked, value is whether anonymous or not
     */
    @Output() readonly anonymousClick = new EventEmitter<boolean>();

    constructor(public readonly anonymousService: AnonymousService) {}
}
