import type { AnimationTriggerMetadata } from '@angular/animations';
import {
    trigger,
    transition,
    style,
    animate,
    keyframes,
} from '@angular/animations';

/**
 * Tries to get the users attention on :enter
 * !there should only be one at a time on the page - use rarely
 */
export function attention(): AnimationTriggerMetadata {
    return trigger('attention', [
        transition(':enter', [
            style({ transform: 'scale(1)' }),
            animate('0.3s 0.3s ease-in', style({ transform: 'scale(1.5)' })),
            style({ transform: 'scale(1.5)' }),
            generateWiggleAnimation(1.5),
            animate('0.3s ease-out', style({ transform: 'scale(1)' })),
        ]),
    ]);
}

function generateWiggleAnimation(scale = 1.5, delay = 0, duration = 2) {
    return animate(
        `${duration}s ${delay}s ease`,
        keyframes([
            style({
                offset: 0,
                transform: `rotate(-3deg) scale(${scale})`,
            }),
            style({ offset: 0.2, transform: `rotate(20deg) scale(${scale})` }),
            style({ offset: 0.4, transform: `rotate(-15deg) scale(${scale})` }),
            style({ offset: 0.6, transform: `rotate(5deg) scale(${scale})` }),
            style({ offset: 0.8, transform: `rotate(-1deg) scale(${scale})` }),
            style({
                offset: 1,
                transform: `rotate(0) scale(${scale})`,
            }),
        ])
    );
}
