import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckboxInputModule } from '@shared/inputs/checkbox-input/checkbox-input.module';
import { ShowHiddenAttributesInputComponent } from './show-hidden-attributes-input.component';

@NgModule({
    declarations: [ShowHiddenAttributesInputComponent],
    imports: [CommonModule, CheckboxInputModule],
    exports: [ShowHiddenAttributesInputComponent],
})
export class ShowHiddenAttributesInputModule {}
