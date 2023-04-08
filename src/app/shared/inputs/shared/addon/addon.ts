import type { Attribute } from '@cache-server/api/tables/attribute';
import type { MetaAttribute } from '@cache-server/api/versions/version';
import type { Languages } from '@core/utility/i18n/languages';
import type { IconType } from '@main-shared/icon/icon-type';

export type Addon = {
    /**
     * if a required symbol (*) should be displayed
     */
    required?: boolean;
    description?: Languages<string | null> | string;
} & (
    | {
          attribute: Attribute;
          metaAttribute?: undefined;
          translateKey?: undefined;
          icon?: undefined;
          string?: undefined;
      }
    | {
          attribute?: undefined;
          metaAttribute: MetaAttribute;
          translateKey?: undefined;
          icon?: undefined;
          string?: undefined;
      }
    | {
          attribute?: undefined;
          metaAttribute?: undefined;
          translateKey?: string;
          /**
           * an icon that is shown before the text
           */
          icon?: IconType;
          string?: undefined;
      }
    | {
          attribute?: undefined;
          metaAttribute?: undefined;
          translateKey?: undefined;
          icon?: undefined;
          string: string | null | undefined;
      }
);
