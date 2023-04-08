import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import type { DateTimeFormat } from '../date-time-formatter.pipe';
import type { RelativeTimeFormat } from '../relative-time-format.pipe';

@Component({
    selector: 'app-display-date',
    templateUrl: './display-date.component.html',
    styleUrls: ['./display-date.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayDateComponent {
    @Input() date!: string;
    @Input() options:
        | {
              /**
               * e.g.: '2 days ago'
               */
              relative: true;
              format: RelativeTimeFormat;
              /**
               * Wether no popover with the absolute datetime should be shown
               */
              noPopover?: true;
          }
        | {
              /**
               * e.g.: '12.8.2020'
               */
              relative: false;
              format: DateTimeFormat;
          } = {
        relative: false,
        format: 'longDate',
    };

    public breakpoints = Breakpoints;
}
