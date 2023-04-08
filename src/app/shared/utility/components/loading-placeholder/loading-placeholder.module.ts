import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadingPlaceholderComponent } from './loading-placeholder/loading-placeholder.component';
import { WithInlineLoadingDirective } from './with-inline-loading.directive';
import { WithLoadingDirective } from './with-loading.directive';

@NgModule({
    declarations: [
        LoadingPlaceholderComponent,
        WithLoadingDirective,
        WithInlineLoadingDirective,
    ],
    imports: [CommonModule],
    exports: [
        LoadingPlaceholderComponent,
        WithLoadingDirective,
        WithInlineLoadingDirective,
    ],
})
export class LoadingPlaceholderModule {}
