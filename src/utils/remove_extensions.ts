/**
 * Remove the file extension from a file name.
 * @param {string} fileName - The name of the file you want to remove the extension from.
 */
export const removeExtensions = (fileName: string) => fileName.split('.').shift();