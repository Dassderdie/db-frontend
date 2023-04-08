import type { DeepWritable } from '@shared/utility/types/writable';
import type { FilesValue, Version } from '../versions/version';

export interface EditValues {
    [attributeId: string]:
        | DeepWritable<Exclude<Version['values'][''], FilesValue>>
        | EditFiles;
}

export interface EditFiles {
    [name: string]: EditFile;
}

export type EditFile = Omit<DeepWritable<FilesValue['']>, 'blobInformation'>;
