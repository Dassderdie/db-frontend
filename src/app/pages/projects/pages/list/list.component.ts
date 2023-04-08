import type { OnDestroy, OnInit } from '@angular/core';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
} from '@angular/core';
import type { Project } from '@cache-server/api/projects/project';
import type { UUID } from '@cache-server/api/uuid';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { ProgressCounter } from '@shared/utility/components/global-loading-placeholder/progress-counter';
import type { ProjectTemplate } from '@projects/core/project-templates/project-templates.service';
import { ProjectTemplatesService } from '@projects/core/project-templates/project-templates.service';
import { AddProjectsModalComponent } from '@projects/feature/add-projects-modal/add-projects-modal.component';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { activateGlobalLoadingPlaceholder } from '@shared/utility/components/global-loading-placeholder/activate-global-loading-placeholder';
import { BsModalService } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
    selector: 'app-project-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent
    extends Destroyed
    implements OnDestroy, OnInit
{
    // To use it in template
    public readonly breakpoints = Breakpoints;

    public filteredUserProjects?: ReadonlyArray<Project>;
    public searchText = '';
    public userProjects?: ReadonlyArray<Project>;
    public projectTemplates?: ReadonlyArray<ProjectTemplate>;

    constructor(
        private readonly bsModalService: BsModalService,
        private readonly projectsService: ProjectsService,
        private readonly roleService: RolesService,
        private readonly projectTemplatesService: ProjectTemplatesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    async ngOnInit() {
        this.projectsService
            .getProjects()
            .pipe(takeUntil(this.destroyed))
            .subscribe((allProjects) => {
                this.userProjects = allProjects;
                this.updateFilteredProjects();
                this.changeDetectorRef.markForCheck();
            });
        this.projectTemplates =
            await this.projectTemplatesService.getProjectTemplates();
        this.changeDetectorRef.markForCheck();
    }

    public updateFilteredProjects() {
        errors.assert(!!this.userProjects);
        this.filteredUserProjects = this.userProjects.filter((project) =>
            project.name.toUpperCase().includes(this.searchText.toUpperCase())
        );
    }

    public openNewProjectModal() {
        this.bsModalService.show(AddProjectsModalComponent);
    }

    public applyProjectTemplate(projectTemplate: ProjectTemplate) {
        const progressCounter = new ProgressCounter();
        this.projectTemplatesService.applyProjectTemplate(
            projectTemplate,
            progressCounter
        );
        activateGlobalLoadingPlaceholder(
            progressCounter,
            _('pages.projects.applying-template-description'),
            this.bsModalService
        );
    }

    public leave(projectId: UUID): void {
        this.roleService.leaveProject(projectId);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
