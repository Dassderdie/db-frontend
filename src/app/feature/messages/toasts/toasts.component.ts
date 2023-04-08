import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessageService } from '@core/utility/messages/message.service';
import { fade } from '@shared/animations/fade';

@Component({
    selector: 'app-toasts',
    templateUrl: './toasts.component.html',
    styleUrls: ['./toasts.component.scss'],
    animations: [fade()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastsComponent {
    constructor(public readonly messageService: MessageService) {}
}
