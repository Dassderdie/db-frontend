import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NotSanitizePipe } from './not-sanitize.pipe';
import { ResponsiveBreakpointExceededPipe } from './responsive-breakpoint-exceeded.pipe';
import { TrackByPropertyPipe } from './track-by-property.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [
        ResponsiveBreakpointExceededPipe,
        TrackByPropertyPipe,
        NotSanitizePipe,
    ],
    exports: [
        ResponsiveBreakpointExceededPipe,
        NotSanitizePipe,
        TrackByPropertyPipe,
    ],
})
export class MainPipesModule {}
