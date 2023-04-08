import type { CustomStorage } from './custom-storage';

export class SimpleStorage implements CustomStorage {
    storage: { [key: string]: unknown } = {};

    public get<T>(key: string): T {
        return this.storage[key] as T;
    }

    public set(key: string, value: unknown) {
        this.storage[key] = value;
    }

    public delete(key: string) {
        delete this.storage[key];
    }

    public deleteAll() {
        this.storage = {};
    }

    public getKeys() {
        return Object.keys(this.storage);
    }
}
