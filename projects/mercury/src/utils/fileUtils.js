import {PATH_SEPARATOR} from "../constants";

export function splitPathIntoArray(path) {
    return path.split(PATH_SEPARATOR).filter(s => s.length > 0);
}

export function uniqueName(fileName, usedNames) {
    if (!usedNames.includes(fileName)) {
        usedNames.push(fileName);
        return fileName;
    }
    const dotPos = fileName.lastIndexOf('.');
    const name = (dotPos >= 0) ? fileName.substring(0, dotPos) : fileName;
    const ext = (dotPos >= 0) ? fileName.substring(dotPos) : '';
    let index = 1;

    while (true) {
        const newName = `${name} (${index})${ext}`;
        if (!usedNames.includes(newName)) {
            usedNames.push(newName);
            return newName;
        }
        index += 1;
    }
}

export const joinPaths = (...paths) => paths
    .map(p => (p && p !== PATH_SEPARATOR ? p : ''))
    .join(PATH_SEPARATOR);

export const addCounterToFilename = (fileName) => {
    // Parse the filename
    const dotPosition = fileName.lastIndexOf('.');
    let baseName = (dotPosition >= 0) ? fileName.substring(0, dotPosition) : fileName;
    const extension = (dotPosition >= 0) ? fileName.substring(dotPosition) : '';

    // By default the counter is set to 2
    let counter = 2;

    // Verify if the filename already contains a counter
    // If so, update the counter in the filename
    const counterMatch = / \((\d+)\)$/;
    const matches = baseName.match(counterMatch);
    if (matches) {
        baseName = baseName.substring(0, baseName.length - matches[0].length);
        counter = parseInt(matches[1], 10) + 1;
    }

    return `${baseName} (${counter})${extension}`;
};

export function parentPath(path) {
    const pos = path.lastIndexOf('/', path.length - 2);
    return (pos > 1) ? path.substring(0, pos) : '';
}

export function fileName(path) {
    const normalizedPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
    const pos = normalizedPath.lastIndexOf('/');
    return (pos > 0) ? normalizedPath.substring(pos + 1) : normalizedPath;
}

/**
 * Extracts the directory within a collection from the full path
 *
 * For example. A full path of /my-collection/all-data would return /all-data
 * @param path Full path including the collection-location. May or may not start with a leading /
 * @returns {string} Directory name within the collection. Starts with a leading '/'
 */
export function getDirectoryFromFullpath(path) {
    // Remove the first directory name from the opened path, in order
    // to remove the previous collection location
    // If there is a leading slash, remove it
    const cleanedPath = path.charAt(0) === '/' ? path.substring(1) : path;
    const firstSlashPosition = cleanedPath.indexOf('/');

    // Without a slash, we are in the root directory
    if (firstSlashPosition === -1) {
        return '/';
    }

    return cleanedPath.substring(firstSlashPosition);
}
