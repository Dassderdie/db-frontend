import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MainPipesModule } from '@main-shared/main-pipes/main-pipes.module';
import { ResponsiveBreakpointExceededPipe } from '@main-shared/main-pipes/responsive-breakpoint-exceeded.pipe';
import { TrackByPropertyPipe } from '@main-shared/main-pipes/track-by-property.pipe';
import { DateObjPipe } from './date-obj.pipe';
import { FilterPipe } from './filter.pipe';
import { I18nPathPipe } from './i18n-path.pipe';
import { IsEmptyObjectPipe } from './is-empty-object.pipe';
import { NumberFormatPipe } from './number-format.pipe';
import { ObjectKeysPipe } from './object-keys.pipe';
import { PrettySizePipe } from './pretty-size.pipe';
import { RemoveLinebreaksPipe } from './remove-linebreaks.pipe';
import { SubstringPipe } from './substring.pipe';
import { ToStringPipe } from './to-string.pipe';
import { TranslateDescriptionsPipe } from './translate-descriptions.pipe';
import { TranslateDisplayNamesPipe } from './translate-display-names.pipe';
import { TypeofPipe } from './typeof.pipe';

@NgModule({
    imports: [CommonModule, MainPipesModule],
    declarations: [
        SubstringPipe,
        RemoveLinebreaksPipe,
        DateObjPipe,
        ObjectKeysPipe,
        TypeofPipe,
        IsEmptyObjectPipe,
        ToStringPipe,
        TranslateDescriptionsPipe,
        TranslateDisplayNamesPipe,
        PrettySizePipe,
        NumberFormatPipe,
        I18nPathPipe,
        FilterPipe,
    ],
    exports: [
        SubstringPipe,
        RemoveLinebreaksPipe,
        ObjectKeysPipe,
        DateObjPipe,
        TypeofPipe,
        TrackByPropertyPipe,
        IsEmptyObjectPipe,
        ToStringPipe,
        TranslateDescriptionsPipe,
        TranslateDisplayNamesPipe,
        ResponsiveBreakpointExceededPipe,
        PrettySizePipe,
        NumberFormatPipe,
        I18nPathPipe,
        FilterPipe,
    ],
})
export class UtilityPipesModule {}
