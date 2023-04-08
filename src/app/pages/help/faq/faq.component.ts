import { HttpClient } from '@angular/common/http';
import type { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { baseUrl } from '@cache-server/http-handler/default-base-url';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { ShareService } from '@core/utility/share/share.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { shortenUrl } from '@shared/utility/functions/shorten-url';
import type { DeepWritable } from '@shared/utility/types/writable';
import type { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { supportMail } from '../support-mail';
import type { Faq } from './faq';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent
    extends Destroyed
    implements OnInit, AfterViewInit, OnDestroy
{
    public faq?: Faq;
    public faq$!: Observable<Faq>;
    public searchText = '';
    /**
     * All answers that are currently opened
     */
    public openAnswers: {
        [id: string]: boolean;
    } = {};
    /**
     * All questions and categories that should be displayed through the search
     */
    public filteredQuestions: FilteredQuestions = {};
    public readonly supportEmail = supportMail;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly i18nService: I18nService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly shareService: ShareService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit(): void {
        this.faq$ = this.i18nService.languageChangesIso639_2$.pipe(
            switchMap((language) =>
                this.httpClient.get<Faq>(
                    `${baseUrl}/assets/faq/${language}.json`
                )
            ),
            takeUntil(this.destroyed)
        );
        this.faq$.pipe(takeUntil(this.destroyed)).subscribe((faq) => {
            this.faq = faq;
            this.updateFilteredQuestions();
            this.changeDetectorRef.markForCheck();
        });
    }

    ngAfterViewInit() {
        // scroll to the question, always when the faq or the fragment changes
        combineLatest([this.activatedRoute.fragment, this.faq$])
            .pipe(
                map((v) => v[0]),
                takeUntil(this.destroyed)
            )
            .subscribe((fragment) => {
                const element = document.querySelector(`#${fragment}`);
                if (!element || !fragment) {
                    return;
                }
                window.scrollTo({
                    top:
                        element.getBoundingClientRect().top +
                        window.pageYOffset -
                        70,
                    behavior: 'smooth',
                });
                this.openAnswers[fragment] = true;
            });
    }

    public updateFilteredQuestions() {
        if (!this.faq) {
            return;
        }
        const newFilteredQuestions: DeepWritable<FilteredQuestions> = {};
        // a question should be shown, if each searchTerm (space separated) is either in the category name, the keywords or the question
        const searchTerms = this.searchText.split(' ');
        for (const category of this.faq) {
            for (const question of category.questions) {
                let isFound = true;
                for (const searchTerm of searchTerms) {
                    // everything is case insensitive
                    const regex = RegExp(searchTerm, 'iu');
                    if (
                        !regex.test(category.name) &&
                        !question.keywords.some((k) => regex.test(k)) &&
                        !regex.test(question.question)
                    ) {
                        isFound = false;
                        break;
                    }
                }
                if (isFound) {
                    if (!newFilteredQuestions[category.id]) {
                        newFilteredQuestions[category.id] = {};
                    }
                    newFilteredQuestions[category.id]![question.id] = true;
                }
            }
        }
        this.filteredQuestions = newFilteredQuestions;
    }

    public toggleAnswer(categoryId: string, questionId: string) {
        const id = categoryId + questionId;
        this.openAnswers[id] = !this.openAnswers[id];
    }

    public shareLink(anchor: string) {
        this.shareService.shareUrl(
            {},
            shortenUrl(`${window.location.href}#${anchor}`)
        );
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}

interface FilteredQuestions {
    readonly [categoryId: string]: {
        readonly [questionId: string]: true;
    };
}
