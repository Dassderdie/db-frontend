/**
 * @returns the file-extension without '.' or undefined if no file-extension could be found
 */
export function getFileExtension(fileName: string) {
    // https://regexr.com/53tem
    // get the file extension with "." and remove it afterwards
    return /\.[^.]+$/u.exec(fileName.toLowerCase())?.[0]?.slice(1);
}
