import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import type { OnChanges } from '@angular/core';
import {
    Component,
    ContentChild,
    HostBinding,
    Input,
    TemplateRef,
    ChangeDetectionStrategy,
    ViewChild,
    ElementRef,
} from '@angular/core';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { BehaviorSubject } from 'rxjs';

const animationDuration = 400;

@Component({
    selector: 'app-animated-if',
    templateUrl: './animated-if.component.html',
    styleUrls: ['./animated-if.component.scss'],
    animations: [
        trigger('expandCollapse', [
            state(
                'expanded',
                style({
                    height: '*',
                })
            ),
            state(
                'collapsed',
                style({
                    height: '0px',
                })
            ),
            transition('expanded <=> collapsed', animate(animationDuration)),
        ]),
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * This component is an alternative to *ngIf that applies a collapse animation if show changes
 * like with *ngIf the content of this template will not be in the dom if show is false
 *
 * This component requires a template to be inserted
 * An easy way to wrap code into a template is just adding
 * an asterisk * to the child of this component
 */
export class AnimatedIfComponent implements OnChanges {
    @Input() show!: boolean;
    @ViewChild('collapseElement', { static: true })
    collapseElement!: ElementRef<HTMLElement>;
    /**
     * This component requires a template to be inserted
     * An easy way to wrap code into a template is just adding
     * an asterisk * to the child of this component
     */
    @ContentChild(TemplateRef, { static: true })
    contentRef!: TemplateRef<unknown>;
    /**
     * to set display: none of the <app-animated-if></app-animated-if> element
     */
    @HostBinding('class') hostClasses = 'display-none';
    /**
     *  whether the wrapper is collapsed or not
     */
    public isCollapsedE$ = new BehaviorSubject(false);
    /**
     *  whether the content should be in the dom (*ngIf)
     */
    public isInDomE$ = new BehaviorSubject(false);
    /**
     * an unique id for identifying wether an async-action should be performed
     */
    private toggleId = 0;

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.show) {
            this.toggleId++;
            const toggleId = this.toggleId;
            if (this.show) {
                // Expand
                this.hostClasses = '';
                this.isInDomE$.next(true);
                setTimeout(() => {
                    if (this.toggleId !== toggleId) {
                        return;
                    }
                    // Expand after content is in dom
                    this.isCollapsedE$.next(false);
                }, 0);
                setTimeout(() => {
                    if (this.toggleId !== toggleId) {
                        return;
                    }
                    const htmlCollapseElement =
                        this.collapseElement.nativeElement;
                    if (htmlCollapseElement) {
                        // Set display after the animation is over to allow the content to change in height
                        htmlCollapseElement.style.display = 'contents';
                        // make the overflow visible (e.g. dropdown overflowing over the container)
                        htmlCollapseElement.style.overflow = 'visible';
                    }
                }, animationDuration);
            } else {
                // Collapse
                this.isCollapsedE$.next(true);
                const htmlCollapseElement = this.collapseElement.nativeElement;
                if (htmlCollapseElement) {
                    htmlCollapseElement.style.display = 'block';
                    htmlCollapseElement.style.overflow = 'hidden';
                }
                // Remove content from dom after the animation is over
                setTimeout(() => {
                    if (this.toggleId !== toggleId) {
                        return;
                    }
                    this.isInDomE$.next(false);
                    this.hostClasses = 'display-none';
                }, animationDuration);
            }
        }
    }
}
