import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { InputControlModule } from '../input-control/input-control.module';
import { DescriptionModule } from '../shared/description/description.module';
import { ValidationModule } from '../shared/validation/validation.module';
import { CapsLockOnDirective } from './caps-lock-on.directive';
import { StringInputComponent } from './string-input.component';

@NgModule({
    declarations: [StringInputComponent, CapsLockOnDirective],
    imports: [
        CommonModule,
        TranslateModule,
        IconModule,
        InputControlModule,
        DirectivesModule,
        ValidationModule,
        DescriptionModule,
    ],
    exports: [StringInputComponent],
})
export class StringInputModule {}
