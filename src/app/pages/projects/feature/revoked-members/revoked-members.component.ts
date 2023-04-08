import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Project } from '@cache-server/api/projects/project';
import type { Role } from '@cache-server/api/roles/role';

@Component({
    selector: 'app-revoked-members',
    templateUrl: './revoked-members.component.html',
    styleUrls: ['./revoked-members.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevokedMembersComponent {
    @Input() project!: Project;
    @Input() revokedRoles!: ReadonlyArray<Role>;
}
