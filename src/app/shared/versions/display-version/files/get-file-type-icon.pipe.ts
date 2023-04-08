import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { getFileExtension } from '@cache-server/api/blobs/get-file-extension';
import type { IconType } from '@main-shared/icon/icon-type';

@Pipe({
    name: 'getFileTypeIcon',
})
export class GetFileTypeIconPipe implements PipeTransform {
    transform(fileName: string): IconType {
        switch (getFileExtension(fileName)) {
            case 'txt':
            case 'odt':
                return 'file-text';
            case 'html':
            case 'htm':
            case 'js':
            case 'css':
            case 'py':
            case 'c':
            case 'cpp':
            case 'xml':
            case 'm':
            case 'mat':
                return 'file-code';
            case 'doc':
            case 'docm':
            case 'docx':
            case 'dot':
                return 'file-word';
            case 'pdf':
                return 'file-pdf';
            case 'csv':
                return 'file-table';
            case 'ppt':
            case 'pptx':
                return 'file-presentation';
            case 'xls':
            case 'xlsx':
                return 'file-excel';
            case 'mp4':
            case 'avi':
            case 'mov':
                return 'file-video';
            case 'mp3':
            case 'wav':
                return 'file-music';
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'png':
            case 'svg':
            case 'bmp':
                return 'file-image';
            case 'zip':
            case 'gz':
                return 'file-zip';
            default:
                return 'file';
        }
    }
}
