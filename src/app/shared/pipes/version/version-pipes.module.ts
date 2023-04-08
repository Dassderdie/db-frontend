import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GetForeignEntryIdPipe } from './get-foreign-entry-id.pipe';

@NgModule({
    declarations: [GetForeignEntryIdPipe],
    imports: [CommonModule],
    exports: [GetForeignEntryIdPipe],
})
export class VersionPipesModule {}
