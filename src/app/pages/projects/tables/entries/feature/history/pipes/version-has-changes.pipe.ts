import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Version } from '@cache-server/api/versions/version';
import { isEqual } from 'lodash-es';

@Pipe({
    name: 'versionHasChanges',
})
export class VersionHasChangesPipe implements PipeTransform {
    transform(version1: Version, version2: Version): boolean {
        return !isEqual(version1.values, version2.values);
    }
}
