import type { JsonObject } from '@shared/utility/types/json-object';

export interface CacheConversationFactory<
    Type extends string,
    ActionMessage extends JsonObject | undefined,
    Data extends JsonObject | number | string | unknown | null | undefined
> {
    message: MessageFactory<Type, ActionMessage>;
    response: ResponseFactory<Type, ActionMessage, Data>;
}

type MessageFactory<
    Type extends string,
    Action extends JsonObject | undefined
> = Action extends undefined
    ? {
          type: Type;
          action?: undefined;
      }
    : {
          type: Type;
          action: Action;
      };

type ResponseFactory<
    Type extends string,
    Action extends JsonObject | undefined,
    Data
> = Action extends undefined
    ? {
          type: Type;
          action?: undefined;
          data: Data;
      }
    : {
          type: Type;
          action: Action;
          data: Data;
      };
