import type { TemplateRef } from '@angular/core';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { SpecialInputComponent } from '../shared/special-input-component';
import { StringInput } from './string-input';

@Component({
    selector: 'app-string-input',
    templateUrl: './string-input.component.html',
    styleUrls: ['./string-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringInputComponent extends SpecialInputComponent {
    @Input() prependTemplate: TemplateRef<unknown> | null = null;
    @Input() appendTemplate: TemplateRef<unknown> | null = null;
    @Input() control!: StringInput;

    public capsLockOn = false;
    public passwordVisible = false;

    public openLink(link: string | null) {
        if (link) {
            window.open(link);
        } else {
            errors.error({ message: 'Invalid Link!' });
        }
    }
}
