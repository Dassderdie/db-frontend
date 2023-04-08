import type { FilesInputValues } from '../files-input-values';

export class FileNamesStore {
    public static has(value: FilesInputValues, name: string) {
        return !!value.currentFileNames[name];
    }

    public static add(value: FilesInputValues, name: string) {
        if (value.currentFileNames[name]) {
            errors.error({
                message: `file-name ${name} has already been used`,
            });
        }
        value.currentFileNames[name] = true;
    }

    public static remove(value: FilesInputValues, name: string) {
        if (!value.currentFileNames[name]) {
            errors.error({
                message: `file-name ${name} can not get removed if he doesn't exist`,
            });
        }
        delete value.currentFileNames[name];
    }

    public static reset(value: FilesInputValues) {
        value.currentFileNames = {};
    }
}
