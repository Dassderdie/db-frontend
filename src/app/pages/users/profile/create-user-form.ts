import type { User } from '@cache-server/api/users/user';
import type { Languages } from '@core/utility/i18n/languages';
import { languages } from '@core/utility/i18n/languages';
import { Form } from '@shared/inputs/form';
import { makeCustom } from '@shared/inputs/input/input';
import { SelectInput } from '@shared/inputs/select-input/select-input';
import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Observable } from 'rxjs';
import { Option } from '@shared/inputs/select-input/option';
import { map } from 'rxjs/operators';

export function createUserForm(user: User, user$: Observable<User>) {
    return new Form([
        makeCustom(
            new StringInput('name', user.name, {
                validators: [
                    CustomValidators.required(),
                    CustomValidators.minLength(4),
                    CustomValidators.maxLength(255),
                ],
                autocomplete: 'name',
            }),
            {
                leftAddons: [
                    {
                        translateKey: _('user.name'),
                    },
                ],
            }
        ),
        makeCustom(
            new SelectInput<keyof Languages<unknown>>(
                'language',
                user.language ? user.language : languages[0]!.id,
                languages.map(
                    (lang) =>
                        new Option(lang.id, {
                            text: lang.translateKey,
                            kind: 'translate',
                            icons: [lang.id],
                        })
                ),
                {
                    validators: [CustomValidators.required()],
                }
            ),
            {
                leftAddons: [
                    {
                        translateKey: _('user.language'),
                    },
                ],
            }
        ),
        makeCustom(
            new SelectInput<string | null>(
                'publicEmail',
                user.publicEmail ? user.publicEmail : null,
                user$.pipe(
                    map((user1) => [
                        new Option(null, {
                            text: _('user.unset-publicEmail'),
                            kind: 'translate',
                            icons: ['anonymous'],
                        }),
                        ...generateEmailOptions(user1),
                    ])
                )
            ),
            {
                leftAddons: [
                    {
                        translateKey: _('user.public-email'),
                        icon: 'public-email',
                    },
                ],
            }
        ),
        makeCustom(
            new SelectInput<string>(
                'notificationEmail',
                user.notificationEmail,
                user$.pipe(map((user1) => generateEmailOptions(user1))),
                {
                    validators: [CustomValidators.required()],
                }
            ),
            {
                leftAddons: [
                    {
                        translateKey: _('user.notification-email'),
                        icon: 'notification-email',
                    },
                ],
            }
        ),
    ] as const);
}

function generateEmailOptions(user: User): ReadonlyArray<Option<string>> {
    return Object.keys(user.emails).map(
        (email) =>
            new Option(email, {
                text: email,
                kind: 'string',
            })
    );
}
