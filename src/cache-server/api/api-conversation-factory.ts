import type { CacheConversationFactory } from '@cache-server/conversation-factory';
import type { JsonObject } from '@shared/utility/types/json-object';

export interface ApiConversationFactory<
    Type extends string,
    Class extends JsonObject,
    NormalFctNames extends keyof Class = never,
    SubscribableFctNames extends keyof Class = never
> {
    /**
     * A conversation that will per message return 1 response
     * For some the user have to be logged in, for some not (login, register, ...)
     * Examples: create, delete, edit sth., ...
     */
    normal: ConversationFactoryPUnion<Type, Class, NormalFctNames>;
    /**
     * A conversation that will per message return 1 response
     * For some the user have to be logged in, for some not (login, register, ...)
     * Examples: create, delete, edit sth., ...
     */
    subscribable: ConversationFactoryPUnion<Type, Class, SubscribableFctNames>;
    /**
     * the union of normal and subscribable
     */
    all:
        | ConversationFactoryPUnion<Type, Class, NormalFctNames>
        | ConversationFactoryPUnion<Type, Class, SubscribableFctNames>;
}

type ConversationFactoryPUnion<
    Type extends string,
    Class extends JsonObject,
    FctName extends keyof Class
> = {
    [name in FctName]: ApiConversationFactoryP<Type, Class, name>;
}[FctName];

type ApiConversationFactoryP<
    Type extends string,
    Class extends JsonObject,
    FctName extends keyof Class,
    // TODO: improve typings by replacing (options: any) with (options: object)
    Fct extends (options?: any) => Promise<any> = Class[FctName] extends (
        options?: any
    ) => Promise<any>
        ? Class[FctName]
        : never,
    Data extends Awaited<ReturnType<Fct>> = Awaited<ReturnType<Fct>>,
    Options = Parameters<Fct>[0],
    Action extends {
        kind: FctName;
        options?: Options;
    } = Options extends JsonObject | number | string | null // workaround for ApiConversationFactory<any,any,any,any> to have options optional
        ? {
              kind: FctName;
              options: Options;
          }
        : {
              kind: FctName;
              options?: Options;
          }
    // Workaround for using an interface instead of a type alias because
    // using a type alias causes errors (maybe https://github.com/microsoft/TypeScript/issues/14174)
> = CacheConversationFactory<Type, Action, Data>;

/**
 * See https://github.com/microsoft/TypeScript/pull/21613
 * TODO: replace with official Awaited coming with 4.?
 */
type Awaited<T> = T extends {
    then: (onfulfilled: (value: infer U) => any) => any;
}
    ? U
    : T extends { then: (...args: any[]) => any }
    ? never
    : T;
