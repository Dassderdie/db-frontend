import { ChangeDetectionStrategy, Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-company-details',
    templateUrl: './company-details.component.html',
    styleUrls: ['./company-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailsComponent {
    public readonly environment = environment;
}
