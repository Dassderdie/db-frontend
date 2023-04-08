import { Injectable } from '@angular/core';
import type { CanDeactivate } from '@angular/router';

export interface DeactivatableComponent {
    canDeactivate: (
        $event?: BeforeUnloadEvent | undefined
    ) => Promise<boolean> | boolean;
}

@Injectable({ providedIn: 'root' })
export class DeactivationGuard
    implements CanDeactivate<DeactivatableComponent>
{
    canDeactivate(component: DeactivatableComponent) {
        return component.canDeactivate ? component.canDeactivate() : true;
    }
}
