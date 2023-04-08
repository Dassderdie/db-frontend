import type { DisplayName } from '@cache-server/api/tables/display-name';
import type { UUID } from '@cache-server/api/uuid';
import type { IconType } from '@main-shared/icon/icon-type';

export class Option<T, U = DisplayName | string> {
    /**
     * @param value the value of this option
     * @param name the values needed to display a name to the user
     * @param disabled if the option should be disabled
     */
    constructor(
        public value: T,
        public name:
            | {
                  /**
                   * the displayed text
                   */
                  text: U;
                  /**
                   * string - text is normal string
                   * translate - translate text
                   * displayName - text is displayName
                   */
                  kind: U extends string
                      ? 'string' | 'translate'
                      : 'displayName';
                  /**
                   * icons which will be displayed on the left side of the option
                   */
                  icons?: IconType[];
              }
            | {
                  /**
                   * the id of the member who's name should be displayed
                   */
                  userId: UUID;
                  /**
                   * the id of the project the member belongs to
                   */
                  projectId: UUID;
              },
        public disabled = false
    ) {}
}
