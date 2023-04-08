import { getFileMimeType } from './get-file-mime-type';

export function setBlobType(blob: Blob, fileName: string): Blob {
    // See https://stackoverflow.com/a/50875615/12698757
    return blob.slice(0, blob.size, getFileMimeType(fileName));
}
