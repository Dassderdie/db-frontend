import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Output,
} from '@angular/core';

@Component({
    selector: 'app-file-buttons',
    templateUrl: './file-buttons.component.html',
    styleUrls: ['./file-buttons.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * This component displays the preview- and download-button for files.
 */
export class FileButtonsComponent {
    /**
     * Emits when the files should get downloaded
     */
    @Output() readonly preview = new EventEmitter<undefined>();
    /**
     * Emits when the files should get downloaded
     */
    @Output() readonly download = new EventEmitter<undefined>();
}
