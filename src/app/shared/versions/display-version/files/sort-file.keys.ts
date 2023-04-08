import type { FilesValue } from '@cache-server/api/versions/version';
import type { FilesInputValues } from '@tables/shared/attribute-inputs/files/files-input-values';

/**
 * @param keys the keys that should be sorted in files (in most cases this is the fileName)
 * @param sortAttr the attribute after which should be sorted
 * @param sortOrder 1 is ascending, -1 is descending
 * @param files an dictionary/map where the keys are the provided keys and the value is the value of the files
 * @param getNameFct a function that transforms a key to the appropriate fileName (file with changed name)
 * @returns the sorted keys
 */
export function sortFileKeys(
    keys: ReadonlyArray<string>,
    sortAttr: 'name' | 'size',
    sortOrder: -1 | 1,
    files: FilesInputValues['files' | 'newFiles'] | FilesValue | null,
    getNameFct: (key: string) => string = (key) => key
): string[] {
    let compareFn: (key1: string, key2: string) => number;
    switch (sortAttr) {
        case 'name':
            compareFn = (key1, key2) =>
                sortOrder * getNameFct(key1).localeCompare(getNameFct(key2));
            break;
        case 'size':
            compareFn = (key1, key2) => {
                const file1 = files?.[key1];
                const file2 = files?.[key2];
                if (file1 && file2) {
                    return (
                        sortOrder *
                        (file1.blobInformation.rawSize -
                            file2.blobInformation.rawSize)
                    );
                }
                errors.error({
                    message: `Unknown file/value`,
                    logValues: { files, file1, file2 },
                });
                return 0;
            };
            break;
        default:
            errors.error({
                message: `Unknown sortKey ${sortAttr}`,
            });
            compareFn = (key1, key2) => sortOrder * key1.localeCompare(key2);
    }
    return [...keys].sort(compareFn);
}
