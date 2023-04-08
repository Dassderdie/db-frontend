import { ChangeDetectionStrategy, Component } from '@angular/core';
import { baseUrl } from '@cache-server/http-handler/default-base-url';
import { supportMail } from '../support-mail';

@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportComponent {
    public readonly baseUrl = baseUrl;
    public readonly supportEmail = supportMail;
}
