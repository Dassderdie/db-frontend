import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DescriptionModule } from '../shared/description/description.module';
import { ValidationModule } from '../shared/validation/validation.module';
import { StringInputModule } from '../string-input/string-input.module';
import { RealStringInputComponent } from './real-string-input.component';

@NgModule({
    declarations: [RealStringInputComponent],
    imports: [
        CommonModule,
        StringInputModule,
        ValidationModule,
        DescriptionModule,
    ],
    exports: [RealStringInputComponent],
})
export class RealStringInputModule {}
