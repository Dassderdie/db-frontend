import * as mime from 'mime';
import { getFileExtension } from './get-file-extension';

export function getFileMimeType(fileName: string): string {
    const fileExtension = getFileExtension(fileName);
    let mimeType: string | null = '';
    if (fileExtension) {
        mimeType = mime.getType(fileExtension);
    }
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return mimeType || 'application/octet-stream';
}
