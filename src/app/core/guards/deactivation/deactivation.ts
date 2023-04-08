import { Directive, HostListener } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ConfirmationModalService } from '../../utility/confirmation-modal/confirmation-modal.service';
import type { DeactivatableComponent } from './deactivation.guard';

@Directive()
export class DeactivationDirective implements DeactivatableComponent {
    public deactivationGuards: DeactivationGuard[] = [];

    constructor(public readonly confirmationModal: ConfirmationModalService) {}

    addDeactivationGuard($event: DeactivationGuard) {
        this.deactivationGuards.push($event);
    }

    /**
     * Checks, whether the component can be deactivated or not
     *
     * A route can be deactivated if no changes to the forms were made
     * or if the user explicitly discards them
     *
     * If a BeforeUnloadEvent is given, the user  will be prompted
     * by the browser (when he closes the tab or navigates using the address bar)
     *
     * @param $event Optional before unload event
     */
    @HostListener('window:beforeunload', ['$event']) canDeactivate(
        $event?: BeforeUnloadEvent
    ) {
        let notDeactivateable = false;
        for (const canDeactivate of this.deactivationGuards) {
            if (canDeactivate()) {
                notDeactivateable = true;
                break;
            }
        }

        if (!notDeactivateable) {
            return true;
        }

        if ($event) {
            $event.returnValue =
                'You have unsaved changes! Do you really want to leave this page?';
            return false;
        }

        return this.confirmationModal
            .confirm({
                title: _('deactivation.title'),
                description: _('deactivation.description'),
                btnOkText: _('deactivation.btnOkText'),
                kind: 'danger',
            })
            .then((v) => !!v);
    }
}

type DeactivationGuard = () => boolean;
