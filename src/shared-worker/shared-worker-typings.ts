// TODO: workaround because always either angular or ts have problems with multiple tsconfigs in the build-process with multiple scopes/libs
// from @types/sharedworker
// Type definitions for SharedWorker
// Project: http://www.w3.org/TR/workers/
// Definitions by: Toshiya Nakakura <https://github.com/nakakura>
//                 M. Boughaba <https://github.com/mboughaba>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.0
export interface SharedWorkerGlobalScope extends Worker {
    onconnect: (event: MessageEvent) => void;
}
