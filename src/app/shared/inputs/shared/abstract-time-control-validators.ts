import type { AbstractControl, ValidationErrors } from '@angular/forms';

export class AbstractTimeControlValidators {
    static dateTime = (control: AbstractControl): ValidationErrors | null =>
        /^([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(([Zz])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/u.test(
            control.value
        ) || !control.value
            ? null
            : {
                  dateTime: {
                      value: control.value,
                  },
              };
    static date = (control: AbstractControl): ValidationErrors | null =>
        /^([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/u.test(
            control.value
        ) || !control.value
            ? null
            : {
                  date: {
                      value: control.value,
                  },
              };
    static timezone = (control: AbstractControl): ValidationErrors | null =>
        /^$|^(([01][0-9]|2[0-3]):[0-5][0-9])$/u.test(control.value) ||
        !control.value
            ? null
            : {
                  timezone: {
                      value: control.value,
                  },
              };
}
