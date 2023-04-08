/**
 * @param fullName the name of the files including the extension
 * @param extension the file extension excluding the '.' e.g. ('txt')
 * @returns the fileName without the extension (if provided)
 */
export function getFileName(fullName: string, extension?: string) {
    return fullName.slice(
        0,
        // the length of the string without (extension including the '.') on the end
        fullName.length - (extension ? extension.length + 1 : 0)
    );
}
