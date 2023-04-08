import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { UUID } from '@cache-server/api/uuid';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';

@Pipe({
    name: 'projectsApi',
})
export class ProjectsApiPipe implements PipeTransform {
    constructor(private readonly projectsService: ProjectsService) {}

    transform(projectsId: UUID) {
        return this.projectsService.getProject(projectsId);
    }
}
