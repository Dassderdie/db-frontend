import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Validator } from '@shared/utility/classes/state/validator-state';
import { TimeInput } from '../../time-input/time-input';

export class CustomValidators {
    static required(): Validator<any> {
        return (value) =>
            value === null
                ? {
                      required: {
                          value,
                          translationKey: _('validators.error.required'),
                      },
                  }
                : null;
    }
    static min(min: number): Validator<number | null> {
        return (value) =>
            value !== null && value < min
                ? {
                      min: {
                          value,
                          min,
                          translationKey: _('validators.error.min'),
                      },
                  }
                : null;
    }
    static max(max: number): Validator<number | null> {
        return (value) =>
            value !== null && value > max
                ? {
                      maximum: {
                          value,
                          max,
                          translationKey: _('validators.error.max'),
                      },
                  }
                : null;
    }
    static maxLength(maxLength: number): Validator<string | null> {
        return (value) =>
            value !== null && value.length > maxLength
                ? {
                      maxLength: {
                          value,
                          maxLength,
                          translationKey: _('validators.error.maxLength'),
                          difference: value.length - maxLength,
                      },
                  }
                : null;
    }
    static minLength(minLength: number): Validator<string | null> {
        return (value) =>
            value !== null && value.length < minLength
                ? {
                      maxLength: {
                          value,
                          minLength,
                          translationKey: _('validators.error.minLength'),
                          difference: minLength - value.length,
                      },
                  }
                : null;
    }
    static pattern(pattern: RegExp | string): Validator<string | null> {
        return (value) =>
            value !== null && !RegExp(pattern, 'u').test(value)
                ? {
                      pattern: {
                          value,
                          pattern,
                          translationKey: _('validators.error.pattern'),
                      },
                  }
                : null;
    }
    static timeMin(timeMin: string): Validator<string | null> {
        return (value) =>
            new Date(TimeInput.dummyDate + timeMin).getTime() <=
                new Date(TimeInput.dummyDate + value).getTime() ||
            value === null
                ? null
                : {
                      timeMin: {
                          min: timeMin,
                          value,
                          translationKey: _('validators.error.timeMin'),
                      },
                  };
    }
    static timeMax(timeMax: string): Validator<string | null> {
        return (value) =>
            new Date(TimeInput.dummyDate + timeMax).getTime() >=
                new Date(TimeInput.dummyDate + value).getTime() || !value
                ? null
                : {
                      timeMax: {
                          max: timeMax,
                          value,
                          translationKey: _('validators.error.timeMax'),
                      },
                  };
    }
    static dateMin(dateMin: string): Validator<string | null> {
        return (value) =>
            !value || new Date(dateMin).getTime() <= new Date(value).getTime()
                ? null
                : {
                      dateMin: {
                          min: dateMin,
                          value,
                          translationKey: _('validators.error.dateMin'),
                      },
                  };
    }
    static dateMax(dateMax: string): Validator<string | null> {
        return (value) =>
            !value || new Date(dateMax).getTime() >= new Date(value).getTime()
                ? null
                : {
                      dateMax: {
                          max: dateMax,
                          value,
                          translationKey: _('validators.error.dateMax'),
                      },
                  };
    }
    static regExp(): Validator<string | null> {
        return (value) => {
            try {
                if (value) {
                    RegExp(value, 'u');
                }
            } catch {
                if (value !== null) {
                    return {
                        regExp: {
                            value,
                            translationKey: _('validators.error.regExp'),
                        },
                    };
                }
            }
            return null;
        };
    }
}
