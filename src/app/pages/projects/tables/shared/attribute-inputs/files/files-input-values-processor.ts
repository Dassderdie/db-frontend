import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { getFileExtension } from '@cache-server/api/blobs/get-file-extension';
import { setBlobType } from '@cache-server/api/blobs/set-blob-type';
import type {
    EditFile,
    EditFiles,
} from '@cache-server/api/edit-entries/edit-values';
import type { UUID } from '@cache-server/api/uuid';
import type { FilesValue } from '@cache-server/api/versions/version';
import { cloneDeep, isEmpty } from 'lodash-es';
import type { FilesAttribute } from '@cache-server/api/tables/attribute';
import type { FilesInputValues } from './files-input-values';
import { getFileName } from './get-file-name';
import type { NewFile } from './new-file';
import type { PresentFile } from './present-file';
import { FileNamesStore } from './many-files-input/file-names-store';

export class FilesInputValuesProcessor {
    public static getNumberOfFiles(value: FilesInputValues) {
        return (
            value.numberOfAlreadyPresentFiles +
            value.numberOfNewFiles -
            value.numberOfDeletedFiles
        );
    }

    /**
     * @returns filesValue object with all potential changes applied, changes to this object have no side-effects
     */
    public static getCleanedFiles(value: FilesInputValues): EditFiles {
        const finalFiles: EditFiles = {};
        for (const [fileName, file] of Object.entries(value.files)) {
            if (file.deleted) {
                continue;
            }
            const finalFile: EditFile = {
                blobId: file.blobId,
            };
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const finalName = file.changedFileName ?? fileName;
            finalFiles[finalName] = finalFile;
        }
        return finalFiles;
    }

    public static setInitialFiles(
        value: FilesInputValues,
        initialValue: FilesValue | null | undefined,
        attribute: FilesAttribute
    ) {
        const oldFiles = value.files;
        const newInitialFiles = cloneDeep(initialValue) ?? {};
        // reset all numbersOf (no numberOfNewFiles, because they didn't get changed)
        FileNamesStore.reset(value);
        value.numberOfDeletedFiles = 0;
        value.numberOfChangedFileNames = 0;
        value.numberOfFilesWithErrors = 0;
        value.files = newInitialFiles;
        value.numberOfAlreadyPresentFiles = value.files
            ? Object.keys(value.files).length
            : 0;
        // merge oldFiles with newInitialFiles & correctly calculate the numbersOf...
        for (const [fileName, file] of Object.entries(value.files)) {
            const oldFile = oldFiles[fileName] as PresentFile | undefined;
            if (oldFile?.deleted) {
                this.deletePresentFile(value, fileName, attribute);
            }
            FileNamesStore.add(value, file.changedFileName ?? fileName);
            // TODO: keep rename of oldFile
        }
        // there could be inconsistencies with newFiles -> reset them (renames them if necessary)
        const oldNewFiles: {
            name: string;
            blob: Blob;
            blobId?: UUID;
        }[] = [];
        for (const [name, newFile] of Object.entries(value.newFiles)) {
            oldNewFiles.push({
                name,
                blob: newFile.blob,
            });
            this.deleteNewFile(value, name);
        }
        for (const newFile of oldNewFiles) {
            this.addNewFile(
                value,
                newFile.name,
                newFile.blob,
                attribute,
                newFile.blobId
            );
        }
    }

    public static updateAllErrors(
        value: FilesInputValues,
        attribute: FilesAttribute
    ) {
        // recheck all errors
        for (const [fileName, file] of Object.entries(value.files)) {
            this.updateErrors(value, fileName, file, attribute);
        }
        for (const [fileName, newFile] of Object.entries(value.newFiles)) {
            this.updateErrors(value, fileName, newFile, attribute);
        }
    }

    /**
     * @returns wether any file is currently renamed, deleted or should be added
     */
    public static hasChanges(value: FilesInputValues) {
        return (
            value.numberOfDeletedFiles !== 0 ||
            value.numberOfChangedFileNames !== 0 ||
            value.numberOfNewFiles !== 0
        );
    }

    /**
     * @returns wether any file is invalid
     */
    public static hasErrors(value: FilesInputValues) {
        return value.numberOfFilesWithErrors > 0;
    }

    /**
     * Deletes a currently present file
     */
    public static deletePresentFile(
        value: FilesInputValues,
        fileName: string,
        attribute: FilesAttribute
    ) {
        const presentFile = value.files[fileName]!;
        if (!presentFile.deleted) {
            presentFile.deleted = true;
            value.numberOfDeletedFiles++;
            FileNamesStore.remove(
                value,
                presentFile.changedFileName ?? fileName
            );
            if (presentFile.changedFileName) {
                value.numberOfChangedFileNames--;
                delete presentFile.changedFileName;
            }
        }
        this.updateErrors(value, fileName, presentFile, attribute);
    }

    public static renamePresentFile(
        value: FilesInputValues,
        fileName: string,
        newName: string,
        attribute: FilesAttribute
    ) {
        const presentFile = value.files[fileName]!;
        const oldName = presentFile.changedFileName ?? fileName;
        const newSafeName = this.getSafeFileName(value, newName);
        if (newSafeName !== oldName && !presentFile.deleted) {
            FileNamesStore.remove(value, oldName);
            presentFile.changedFileName = newSafeName;
            if (newSafeName === fileName) {
                // has been changed back
                value.numberOfChangedFileNames--;
            } else {
                value.numberOfChangedFileNames++;
            }
            FileNamesStore.add(value, newSafeName);
            this.updateErrors(value, fileName, presentFile, attribute);
        }
    }

    public static restorePresentFile(
        value: FilesInputValues,
        fileName: string,
        attribute: FilesAttribute
    ) {
        const presentFile = value.files[fileName]!;
        if (presentFile.deleted) {
            value.numberOfDeletedFiles--;
            const saveName = this.getSafeFileName(value, fileName);
            if (saveName !== fileName) {
                presentFile.changedFileName = saveName;
                value.numberOfChangedFileNames++;
            }
            // TODO: numberOfChangedFileNames
            FileNamesStore.add(value, presentFile.changedFileName ?? fileName);
            this.updateErrors(value, fileName, presentFile, attribute);
        }
        delete presentFile.deleted;
    }

    public static addNewFile(
        value: FilesInputValues,
        name: string,
        blob: Blob,
        attribute: FilesAttribute,
        blobId?: UUID
    ) {
        const finalName = this.getSafeFileName(value, name);
        // update the blobs MIME-type to match the file-extension
        setBlobType(blob, name);
        value.newFiles[finalName] = {
            blob,
            blobId,
            blobInformation: {
                rawSize: blob.size,
            },
        };
        FileNamesStore.add(value, finalName);
        value.numberOfNewFiles++;
        this.updateErrors(
            value,
            finalName,
            value.newFiles[finalName]!,
            attribute
        );
    }

    public static deleteNewFile(value: FilesInputValues, name: string) {
        const newFile = value.newFiles[name];
        if (!newFile) {
            return;
        }
        if (newFile.errors) {
            value.numberOfFilesWithErrors--;
        }
        delete value.newFiles[name];
        FileNamesStore.remove(value, name);
        value.numberOfNewFiles--;
    }

    public static renameNewFile(
        value: FilesInputValues,
        oldName: string,
        newName: string,
        attribute: FilesAttribute
    ) {
        const file = value.newFiles[oldName];
        if (!file) {
            return;
        }
        this.deleteNewFile(value, oldName);
        this.addNewFile(value, newName, file.blob, attribute, file.blobId);
    }

    /**
     * The fileName must be unique in newFiles and files
     * @param wantedName the ideal name for the file
     * @returns a (maybe modified) name that is unique
     */
    private static getSafeFileName(
        value: FilesInputValues,
        wantedName: string
    ) {
        // The file-extension inclusive "."
        let extension = getFileExtension(wantedName);
        const nameWithoutExtension = getFileName(wantedName, extension);
        if (extension) {
            extension = `.${extension}`;
        }
        let finalName = wantedName;
        let i = 1;
        while (FileNamesStore.has(value, finalName)) {
            finalName = `${nameWithoutExtension} (${i})${extension ?? ''}`;
            i++;
        }
        return finalName;
    }

    /**
     * Checks wether the file itself has an error (e.g. invalid file-extension)
     */
    private static updateErrors(
        value: FilesInputValues,
        fileName: string,
        file: NewFile | PresentFile,
        attribute: FilesAttribute
    ) {
        let name = fileName;
        if ('changedFileName' in file && file.changedFileName) {
            name = file.changedFileName;
        }
        // reset errors
        if (file.errors) {
            value.numberOfFilesWithErrors--;
        }
        file.errors = {};
        // A deleted file has no errors
        if (!('deleted' in file && file.deleted)) {
            // check wether the fileName is valid
            const generalFileNamePattern =
                /^(?=[^\0/]+$)(?=[^.].?|(.*[^.])|(...+)$).*$/u;
            if (!generalFileNamePattern.test(fileName)) {
                file.errors.noFileName = {
                    translationKey: _('custom-forms.files.errors.noFileName'),
                    name: fileName,
                };
            }
            // check for invalid extension
            const extension = getFileExtension(name);
            const allowedExtensions =
                attribute.kindOptions.allowedFileExtensions;
            if (allowedExtensions) {
                if (extension && !allowedExtensions.includes(extension)) {
                    file.errors.invalidExtension = {
                        translationKey: _(
                            'custom-forms.files.errors.invalidExtension'
                        ),
                        extension,
                        allowedExtensions: allowedExtensions.join(', '),
                    };
                }
            }
            const pattern = attribute.kindOptions.fileNamePattern;
            if (pattern) {
                const fileNameNoExtension = getFileName(name, extension);
                if (
                    extension &&
                    !RegExp(pattern, 'u').test(fileNameNoExtension)
                ) {
                    file.errors.invalidName = {
                        translationKey: _(
                            'custom-forms.files.errors.invalidName'
                        ),
                        name: fileNameNoExtension,
                        pattern,
                    };
                }
            }
        }
        // apply error
        if (isEmpty(file.errors)) {
            delete file.errors;
        } else {
            value.numberOfFilesWithErrors++;
        }
    }
}
