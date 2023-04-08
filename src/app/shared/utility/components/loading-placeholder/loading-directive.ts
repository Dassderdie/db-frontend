import type {
    ViewContainerRef,
    ComponentFactoryResolver,
    ChangeDetectorRef,
} from '@angular/core';
import { LoadingPlaceholderComponent } from './loading-placeholder/loading-placeholder.component';

// See https://stackoverflow.com/a/53076285
export class LoadingDirective {
    constructor(
        private readonly viewContainerRef: ViewContainerRef,
        private readonly componentFactoryResolver: ComponentFactoryResolver,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    // TODO: lazy init
    private readonly factory =
        this.componentFactoryResolver.resolveComponentFactory(
            LoadingPlaceholderComponent
        );

    // the clearing of the timeout is just a precautious measure - I could never witness a corruption without it
    private timeout?: NodeJS.Timeout;

    protected setNgIf(val: any, inline: LoadingPlaceholderComponent['inline']) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (!val) {
            this.createComponent(inline);
        }
        this.changeDetectorRef.markForCheck();
    }

    private createComponent(inline: LoadingPlaceholderComponent['inline']) {
        // There is sometimes an very weird error, where the component seems to be cleared after initialisation if synchronous
        this.timeout = setTimeout(() => {
            this.timeout = undefined;
            const createdComponent = this.viewContainerRef.createComponent(
                this.factory
            );
            createdComponent.instance.inline = inline;
            this.changeDetectorRef.markForCheck();
        }, 0);
    }
}
