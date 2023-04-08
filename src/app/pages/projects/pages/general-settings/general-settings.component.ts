import type { OnDestroy, OnInit } from '@angular/core';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Project } from '@cache-server/api/projects/project';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { DeactivationDirective } from '@core/guards/deactivation/deactivation';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { MessageService } from '@core/utility/messages/message.service';
import { ProjectTemplatesService } from '@projects/core/project-templates/project-templates.service';
import { CheckboxInput } from '@shared/inputs/checkbox-input/checkbox-input';
import { Form } from '@shared/inputs/form';
import { makeCustom } from '@shared/inputs/input/input';
import { MarkdownInput } from '@shared/inputs/markdown-input/markdown-input';
import { StringInput } from '@shared/inputs/string-input/string-input';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { projectValidators } from '../../shared/project-validators';

@Component({
    selector: 'app-general-settings',
    templateUrl: './general-settings.component.html',
    styleUrls: ['./general-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralProjectSettingsComponent
    extends DeactivationDirective
    implements OnInit, OnDestroy, Destroyed
{
    readonly destroyed = new Subject();
    public project?: Project;
    public projectEditing?: Promise<unknown>;
    public projectDeleting?: Promise<unknown>;

    public readonly generalSettingsForm = new Form([
        makeCustom(
            new StringInput('name', null, {
                validators: projectValidators.name,
            }),
            {
                leftAddons: [
                    {
                        translateKey: _('pages.projects.generalSettings.name'),
                    },
                ],
            }
        ),
        new MarkdownInput(
            'description',
            null,
            { translateKey: _('pages.projects.generalSettings.description') },
            {
                validators: projectValidators.description,
            }
        ),
        new CheckboxInput(
            'allowAnonymousVersionCreation',
            true,
            _('pages.projects.generalSettings.allowAnonymousVersionCreation'),
            'translate'
        ),
    ] as const);

    private onInit = true;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly projectsService: ProjectsService,
        private readonly router: Router,
        private readonly messageService: MessageService,
        private readonly projectTemplatesService: ProjectTemplatesService,
        confirmationModalService: ConfirmationModalService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super(confirmationModalService);
        this.addDeactivationGuard(() => this.generalSettingsForm.changed);
    }

    ngOnInit() {
        this.activatedRoute.params
            .pipe(
                switchMap((params) =>
                    this.projectsService.getProject(params.project)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((project: Project) => {
                this.project = project;
                this.generalSettingsForm.controls[0].setInitialValue(
                    project.name
                );
                this.generalSettingsForm.controls[1].setInitialValue(
                    project.description
                );
                this.generalSettingsForm.controls[2].setInitialValue(
                    project.allowAnonymousVersionCreation
                );
                if (this.onInit) {
                    this.onInit = false;
                    this.generalSettingsForm.controls[0].setValue(project.name);
                    this.generalSettingsForm.controls[1].setValue(
                        project.description
                    );
                    this.generalSettingsForm.controls[2].setValue(
                        project.allowAnonymousVersionCreation
                    );
                }
                this.changeDetectorRef.markForCheck();
            });
    }

    public submitGeneralProjectSettings() {
        errors.assert(!!this.project);
        this.projectEditing = this.projectsService
            .editProject(
                this.project.id,
                this.generalSettingsForm.controls[0].value!,
                this.generalSettingsForm.controls[1].value,
                this.generalSettingsForm.controls[2].value
            )
            .then(() =>
                this.messageService.postMessage({
                    color: 'success',
                    title: _('pages.projects.edit-success-message.title'),
                    body: _('pages.projects.edit-success-message.body'),
                })
            );
    }

    public deleteProject() {
        errors.assert(!!this.project);
        this.confirmationModal
            .confirm({
                title: _('pages.projects.generalSettings.confirm-delete.title'),
                description: _(
                    'pages.projects.generalSettings.confirm-delete.description'
                ),
                btnOkText: _(
                    'pages.projects.generalSettings.confirm-delete.btnOkText'
                ),
                confirmationString: this.project.name,
                kind: 'danger',
            })
            .then((confirm) => {
                if (!confirm) {
                    return;
                }
                errors.assert(!!this.project);
                this.projectDeleting = this.projectsService
                    .deleteProject(this.project.id)
                    .then(() => {
                        this.router.navigate(['projects']);
                        this.messageService.postMessage({
                            color: 'success',
                            title: _(
                                'pages.projects.generalSettings.delete-success.title'
                            ),
                        });
                    });
            });
    }

    public exportProjectTemplate() {
        this.projectTemplatesService.exportProjectTemplate(this.project!.id);
    }

    ngOnDestroy() {
        this.generalSettingsForm.destroy();
        this.destroyed.next(undefined);
    }
}
