import type { PresentFile } from './present-file';
import type { NewFile } from './new-file';
/**
 * The stateful values of the FilesValue
 * - all changes should be made via FilesInputValuesProcessor
 */
export class FilesInputValues {
    public readonly type = 'files';
    public numberOfDeletedFiles = 0;
    public numberOfAlreadyPresentFiles = 0;
    public numberOfNewFiles = 0;
    public numberOfChangedFileNames = 0;
    public numberOfFilesWithErrors = 0;
    /**
     * The files that should be uploaded and then added to this entries files-value
     */
    public newFiles: {
        [fileName: string]: NewFile;
    } = {};

    /**
     * The files that are already present on the server
     * renaming one is achieved by adding the changedFileName property
     */
    public files: {
        [fileName: string]: PresentFile;
    } = {};

    /**
     * The fileNames that are currently used (= presentFiles (not deleted and changedName if available), new files)
     * -> each fileName in the final value has to be unique
     */
    public currentFileNames: { [fileName: string]: true } = {};
}
