import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { UUID } from '@cache-server/api/uuid';
import type { Form } from '@shared/inputs/form';

@Pipe({
    name: 'getControl',
})
export class GetControlPipe implements PipeTransform {
    transform(id: UUID, form: Form): any {
        return form.get(id);
    }
}
