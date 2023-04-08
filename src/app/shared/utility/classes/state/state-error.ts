export type StateError<T> =
    | {
          translationKey: string;
          value?: T;
          /**
           * Wether this error should not be shown when errors are displayed
           */
          hidden?: false | undefined;
          /**
           * The translations of the here specified translationKeys will get passed to the translationKey of the whole error as options
           * example:
           * translation for translationKey
           * `{{ small }} is smaller than {{ big }}`
           * -> translationKeyOptions = {
           *  small: _('small-number'),
           *  big: _('big-number')
           * }
           */
          translationKeyOptions?: {
              [translationKey: string]: string;
          };
          [x: string]: any;
      }
    | {
          translationKey?: undefined;
          value?: T;
          /**
           * Wether this error should not be shown when errors are displayed
           */
          hidden: true;
          [x: string]: any;
      };

export interface StateErrors<T> {
    [errorName: string]: StateError<T>;
}
