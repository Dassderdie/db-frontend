import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { NewProject } from '@cache-server/api/projects/project';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { MessageService } from '@core/utility/messages/message.service';
import { projectValidators } from '@projects/shared/project-validators';
import { Form } from '@shared/inputs/form';
import { MarkdownInput } from '@shared/inputs/markdown-input/markdown-input';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-add-projects-modal',
    templateUrl: './add-projects-modal.component.html',
    styleUrls: ['./add-projects-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProjectsModalComponent {
    public readonly newProjectForm = new Form([
        new StringInput('name', null, {
            validators: projectValidators.name,
        }),
        new MarkdownInput(
            'description',
            null,
            { translateKey: _('pages.projects.addProjectsModal.description') },
            {
                validators: projectValidators.description,
            }
        ),
    ] as const);

    constructor(
        public readonly bsModalRef: BsModalRef,
        private readonly router: Router,
        private readonly projectsService: ProjectsService,
        private readonly messageService: MessageService
    ) {}

    public createProject() {
        const newProject = new NewProject(
            this.newProjectForm.controls[0].value!,
            this.newProjectForm.controls[1].value
        );
        this.projectsService
            .createProject(newProject)
            .then((createdProject) => {
                this.messageService.postMessage({
                    color: 'success',
                    title: _('pages.projects.create-success-message.title'),
                    body: _('pages.projects.create-success-message.body'),
                });
                this.bsModalRef.hide();
                this.router.navigateByUrl(
                    `projects/${createdProject.id}/settings/tables`
                );
            });
    }
}
