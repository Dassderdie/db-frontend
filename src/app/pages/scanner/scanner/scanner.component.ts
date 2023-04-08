import type { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import {
    ElementRef,
    Component,
    ChangeDetectionStrategy,
    ViewChild,
    ChangeDetectorRef,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { UUID } from '@cache-server/api/uuid';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { MessageService } from '@core/utility/messages/message.service';
import { WindowValuesService } from '@core/utility/window-values/window-values.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { QRCode } from 'jsqr';
import type { Point } from 'jsqr/dist/locator';
import { colors } from 'src/app/style-variables';
import type { JsQRMessage } from '../jsqr.worker';
import { getUUIDFromUrl } from '../utility/get-uuid-from-url';
import { ScannedValueStorage } from './scanned-value-storage';

@Component({
    selector: 'app-scanner',
    templateUrl: './scanner.component.html',
    styleUrls: ['./scanner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScannerComponent
    extends Destroyed
    implements OnInit, OnDestroy, AfterViewInit
{
    /**
     * wether the component is destroyed
     */
    private isDestroyed = false;
    private readonly video = document.createElement('video');
    private mediaStream?: MediaStream;
    public status: 'loading' | 'noCamera' | 'noPermission' | 'ok' = 'loading';
    public cameras: ReadonlyArray<MediaDeviceInfo> = [];
    public chosenCamera?: MediaDeviceInfo;
    private readonly jsQrWorker = new Worker(
        new URL('../jsqr.worker.ts', import.meta.url),
        {
            type: 'module',
        }
    );
    private readonly scannedValueStorage: ScannedValueStorage;
    public get scannedValues$() {
        return this.scannedValueStorage.storage$;
    }
    /**
     * The canvas on which the camera stream and qr-scanner feedback should be displayed
     */
    @ViewChild('cameraCanvas') cameraCanvas!: ElementRef<HTMLCanvasElement>;

    /**
     * The amount of frames that have been scanned for qrCodes
     */
    private framesCheckedCounter = 0;
    private jsQrWorkerIsBusy = false;
    private lastRecognizedQR?: {
        color: string;
        location: QRCode['location'];
        time: number;
        /**
         * The value of framesCheckedCounter after this qrCode was found
         */
        onCheckedFrameNumber: number;
    };

    constructor(
        projectsService: ProjectsService,
        tablesService: TablesService,
        versionsService: VersionsService,
        private readonly messageService: MessageService,
        public readonly windowValuesService: WindowValuesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
        this.scannedValueStorage = new ScannedValueStorage(
            projectsService,
            tablesService,
            versionsService,
            messageService,
            this.destroyed
        );
    }

    ngOnInit() {
        // to display the valid state at least for a bit of time
        let lastValidQrData: string | undefined;
        this.jsQrWorker.onmessage = ({
            data: qrcode,
        }: MessageEvent<QRCode>) => {
            this.framesCheckedCounter++;
            this.jsQrWorkerIsBusy = false;
            if (!qrcode) {
                return;
            }
            this.lastRecognizedQR = {
                location: qrcode.location,
                color: this.lastRecognizedQR?.color ?? '',
                time: Date.now(),
                onCheckedFrameNumber: this.framesCheckedCounter,
            };
            if (qrcode.data === lastValidQrData) {
                this.lastRecognizedQR.color = colors.secondary;
                this.changeDetectorRef.markForCheck();
                return;
            }
            const scannedValue = this.convertUrl(qrcode.data);
            const status = !scannedValue
                ? 'invalid'
                : this.scannedValueStorage.addScann(scannedValue);
            switch (status) {
                case 'valid':
                    lastValidQrData = qrcode.data;
                    setTimeout(() => (lastValidQrData = undefined), 1000);
                    this.lastRecognizedQR.color = colors.secondary;
                    break;
                case 'alreadyScanned':
                    this.lastRecognizedQR.color = colors.secondary;
                    break;
                case 'invalid':
                    this.lastRecognizedQR.color = colors.invalid;
                    break;
                default:
                    errors.error({ message: `Unknown status: ${status}` });
            }
            this.changeDetectorRef.markForCheck();
        };
    }

    ngAfterViewInit() {
        this.checkForCamera();
    }

    checkForCamera() {
        navigator.mediaDevices
            .enumerateDevices()
            .then((deviceInfos) => {
                this.cameras = deviceInfos.filter(
                    (device) => device.kind === 'videoinput'
                );
                if (this.cameras[0]) {
                    this.startScanning(this.cameras[0]);
                } else {
                    this.status = 'noCamera';
                }
                this.changeDetectorRef.markForCheck();
            })
            .catch((error) => errors.error({ error }))
            .then(() => {
                if (this.status === 'noCamera') {
                    setTimeout(() => {
                        this.checkForCamera();
                    }, 1000);
                }
            });
    }

    public clear() {
        this.scannedValueStorage.clear();
    }

    public startScanning(camera: MediaDeviceInfo) {
        navigator.mediaDevices
            .getUserMedia({
                // ideal instead of exact, because it sometimes doesn't seem to work else (Lenovo Yoga 460, Windows 10 Chrome)
                video: { deviceId: { ideal: camera.deviceId } },
                audio: false,
            })
            .then((stream) => {
                this.mediaStream?.getTracks().forEach((track) => track.stop());
                this.mediaStream = stream;
                this.mediaStream.getTracks().forEach((track) => {
                    track.addEventListener('ended', () => {
                        if (status === 'noCamera') {
                            return;
                        }
                        this.status = 'noCamera';
                        this.checkForCamera();
                        this.changeDetectorRef.markForCheck();
                    });
                });
                this.status = 'ok';
                this.chosenCamera = camera;
                this.video.srcObject = stream;
                this.video.play().catch((error) => errors.error({ error }));
                window.requestAnimationFrame(() => this.tick());
                this.changeDetectorRef.markForCheck();
            })
            .catch((error: any) => {
                errors.error({ error });
                this.status = 'noPermission';
            });
    }

    private drawLine(
        context: CanvasRenderingContext2D,
        begin: Point,
        end: Point,
        color: CanvasGradient | CanvasPattern | string
    ) {
        context.beginPath();
        context.moveTo(begin.x, begin.y);
        context.lineTo(end.x, end.y);
        context.lineWidth = 4;
        context.strokeStyle = color;
        context.stroke();
    }

    private tick() {
        if (this.isDestroyed) {
            return;
        }
        this.status = 'loading';
        const canvasElement = this.cameraCanvas.nativeElement;
        if (
            this.video.readyState >= this.video.HAVE_CURRENT_DATA &&
            canvasElement
        ) {
            const context = canvasElement.getContext('2d')!;
            this.status = 'ok';
            canvasElement.height = this.video.videoHeight;
            canvasElement.width = this.video.videoWidth;
            canvasElement.parentElement!.style.width =
                this.video.videoWidth.toString();
            context.drawImage(
                this.video,
                0,
                0,
                canvasElement.width,
                canvasElement.height
            );
            // If the worker is ready to process a frame then send it one
            if (!this.jsQrWorkerIsBusy) {
                const imageData: JsQRMessage = context.getImageData(
                    0,
                    0,
                    canvasElement.width,
                    canvasElement.height
                );
                this.jsQrWorker.postMessage(imageData);
                // worker is not ready to accept another frame until it finishes processing this one.
                this.jsQrWorkerIsBusy = true;
            }
            if (
                this.lastRecognizedQR &&
                // To smooth rectangles buffer two qr-code checks
                this.framesCheckedCounter -
                    this.lastRecognizedQR.onCheckedFrameNumber <
                    3 &&
                this.lastRecognizedQR.time >= Date.now() - 250
            ) {
                // Draw rectangle around scanned qr-code
                this.drawLine(
                    context,
                    this.lastRecognizedQR.location.topLeftCorner,
                    this.lastRecognizedQR.location.topRightCorner,
                    this.lastRecognizedQR.color
                );
                this.drawLine(
                    context,
                    this.lastRecognizedQR.location.topRightCorner,
                    this.lastRecognizedQR.location.bottomRightCorner,
                    this.lastRecognizedQR.color
                );
                this.drawLine(
                    context,
                    this.lastRecognizedQR.location.bottomRightCorner,
                    this.lastRecognizedQR.location.bottomLeftCorner,
                    this.lastRecognizedQR.color
                );
                this.drawLine(
                    context,
                    this.lastRecognizedQR.location.bottomLeftCorner,
                    this.lastRecognizedQR.location.topLeftCorner,
                    this.lastRecognizedQR.color
                );
            }
        }
        window.requestAnimationFrame(() => this.tick());
        this.changeDetectorRef.markForCheck();
    }

    private convertUrl(url: string): ScannedValue | undefined {
        let incorrectPart = '';
        const projectId = getUUIDFromUrl(url, '/p/', '/t/');
        if (projectId) {
            const tableId = getUUIDFromUrl(url, '/t/', '/e/');
            if (tableId) {
                const entryId = getUUIDFromUrl(url, '/e/', '/');
                if (entryId) {
                    return {
                        projectId,
                        tableId,
                        entryId,
                    };
                }
                incorrectPart = 'entries';
            }
            incorrectPart = 'tables';
        }
        incorrectPart = 'projects';
        this.messageService.postMessage({
            color: 'danger',
            title: _('messages.scanner.url-error.title'),
            body: _('messages.scanner.url-error.body'),
            log: { url, incorrectPart },
        });
        return undefined;
    }

    ngOnDestroy() {
        this.isDestroyed = true;
        this.destroyed.next(undefined);
        this.mediaStream?.getTracks().forEach((track) => track.stop());
    }
}

export interface ScannedValue {
    projectId: UUID;
    tableId: UUID;
    entryId: UUID;
}
