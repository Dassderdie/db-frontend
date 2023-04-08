import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { Role } from '@cache-server/api/roles/role';

@Component({
    selector: 'app-role-permissions',
    templateUrl: './role-permissions.component.html',
    styleUrls: ['./role-permissions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePermissionsComponent {
    @Input() role!: Omit<Role, 'user'>;
}
