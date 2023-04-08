import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingComponent {}
