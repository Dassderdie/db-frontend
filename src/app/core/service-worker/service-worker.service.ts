import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthService } from '@core/cache-client/api/auth/auth.service';
import { MessageService } from '@core/utility/messages/message.service';
import { filter, map, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ServiceWorkerService {
    /**
     * The time interval between each update-check
     */
    private readonly updateInterval = 60 * 60 * 1000;

    constructor(
        private readonly swUpdate: SwUpdate,
        private readonly messageService: MessageService,
        private readonly authService: AuthService
    ) {}

    public checkForUpdate() {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.checkForUpdate();
        }
    }

    /**
     * This function should only be called once
     * and starts regularly checking for updates
     */
    public startUpdateChecking() {
        this.swUpdate.available
            .pipe(
                map((event) =>
                    this.messageService.postMessage(
                        {
                            color: 'warning',
                            title: _('messages.update-available.title'),
                            body: _('messages.update-available.body'),
                            btn: {
                                color: 'primary',
                                key: _('messages.update-available.btn'),
                            },
                        },
                        'alert',
                        null
                    )
                ),
                switchMap((message) => message.eventE$),
                filter((event) => event === 'click')
            )
            .subscribe((event) => {
                this.authService.logout();
            });
        // Timeout to wait until the page is fully loaded
        setTimeout(() => this.checkForUpdate(), 1000);
        setInterval(() => this.checkForUpdate(), this.updateInterval);
    }
}
