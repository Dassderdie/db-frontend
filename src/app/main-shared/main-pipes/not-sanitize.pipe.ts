import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'notSanitize',
})
export class NotSanitizePipe implements PipeTransform {
    constructor(private readonly domSanitizer: DomSanitizer) {}

    transform(html?: string) {
        if (!html) {
            return;
        }
        return this.domSanitizer.bypassSecurityTrustHtml(html);
    }
}
