import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-file-name',
    templateUrl: './file-name.component.html',
    styleUrls: ['./file-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileNameComponent {
    @Input() fileName!: string;
}
