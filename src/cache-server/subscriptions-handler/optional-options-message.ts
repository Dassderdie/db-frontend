import type { ApiConversation } from '@cache-server/api/api-conversation';
import type { PartialBy } from '@shared/utility/types/partial-by';

export type OptionalOptionsMessage<
    Message extends ApiConversation['subscribable']['message']
> =
    | Message
    | {
          [K1 in keyof Message]: K1 extends 'action'
              ? PartialBy<
                    // message.actions.options is optional
                    {
                        [K2 in keyof Message[K1]]: K2 extends 'options'
                            ? Partial<Message[K1][K2]> // message.actions.options has no required properties
                            : Message[K1][K2];
                    },
                    'options'
                >
              : Message[K1];
      };
