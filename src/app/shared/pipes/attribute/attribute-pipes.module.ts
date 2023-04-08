import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AttributeByIdPipe } from './attribute-by-id.pipe';
import { TranslateAttributeTypePipe } from './translate-attribute-type.pipe';
import { IsForeignSingleAttributePipe } from './is-foreign-single-attribute.pipe';

@NgModule({
    declarations: [
        AttributeByIdPipe,
        TranslateAttributeTypePipe,
        IsForeignSingleAttributePipe,
    ],
    imports: [CommonModule],
    exports: [
        AttributeByIdPipe,
        TranslateAttributeTypePipe,
        IsForeignSingleAttributePipe,
    ],
})
export class AttributePipesModule {}
