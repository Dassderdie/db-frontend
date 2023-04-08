export interface FileErrors {
    /**
     * the specified name is no fileName
     */
    noFileName?: {
        translationKey: 'custom-forms.files.errors.noFileName';
        name: string;
    };
    /**
     * The invalid file-extension
     */
    invalidExtension?: {
        translationKey: 'custom-forms.files.errors.invalidExtension';
        extension: string;
        allowedExtensions: string;
    };
    /**
     * The invalid file-name without extension
     */
    invalidName?: {
        translationKey: 'custom-forms.files.errors.invalidName';
        pattern: string;
        name: string;
    };
}
