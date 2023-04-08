import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthModalService } from '@core/auth-modal/auth-modal.service';

@Component({
    selector: 'app-display-tutorial',
    templateUrl: './display-tutorial.component.html',
    styleUrls: ['./display-tutorial.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayTutorialComponent {
    constructor(private readonly authModalService: AuthModalService) {}

    public openAuthModal(preSelectedTab: 'login' | 'register') {
        this.authModalService.show(preSelectedTab);
    }
}
