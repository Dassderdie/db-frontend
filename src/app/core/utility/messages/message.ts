import type { UUID } from '@cache-server/api/uuid';
import { Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import type { CustomTimer } from './custom-timer';

export interface MessageConfig {
    /**
     * The translation-key for the title (don't forget the marker _())
     */
    title: string;
    /**
     * The translation-key for the body (don't forget the marker _())
     */
    body?: string;
    /**
     * The 'click'-event will be emitted over the eventSubject
     */
    btn?: {
        /**
         * The translation-key for a btn. The 'click'-event will be emitted over the eventSubject
         */
        key: string;
        color:
            | 'danger'
            | 'info'
            | 'primary'
            | 'secondary'
            | 'success'
            | 'warning';
    };
    /**
     * A json-value that should be logged (e.g. for errors)
     */
    log?: unknown;
    /**
     * Which color should the message have?
     */
    color: 'danger' | 'info' | 'success' | 'warning';
}

export class Message {
    public id: UUID = uuidv4();
    /**
     * The number of similar messages (= same config) that have been posted
     */
    public amount = 1;
    public timer?: CustomTimer;
    public readonly eventE$ = new Subject<'click'>();

    constructor(public readonly config: MessageConfig) {}

    public destroy() {
        this.timer?.destroy();
    }
}
