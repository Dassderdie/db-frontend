import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import * as qrCode from 'qrcode';

@Pipe({
    name: 'getQrCodeDataUrl',
})
export class GetQrCodeDataUrlPipe implements PipeTransform {
    async transform(url: string): Promise<string> {
        return qrCode.toDataURL(url, {
            margin: 0,
            errorCorrectionLevel: 'L',
        });
    }
}
