/**
 * A storage that must also store ReplaySubjects
 */
export interface CustomStorage<Value = unknown> {
    get: <T extends Value>(typeKey: string) => T | undefined;
    delete: (typeKey: string) => void;
    set: (typeKey: string, value: Value) => void;
    deleteAll: () => void;
    getKeys: () => string[];
}
