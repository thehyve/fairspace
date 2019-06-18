import {PATH_SEPARATOR} from "../constants";

export function splitPathIntoArray(path) {
    return path.split(PATH_SEPARATOR).filter(s => s.length > 0);
}

// the extension includes a dot in some cases and is empty in others. That will very much help in reusing logic
export const getBaseNameAndExtension = (fileName) => {
    if (!fileName) {
        return {baseName: '', extension: ''};
    }

    const dotPosition = fileName.lastIndexOf('.');
    const baseName = (dotPosition > 0) ? fileName.substring(0, dotPosition) : fileName;
    const extension = (dotPosition > 0) ? fileName.substring(dotPosition) : '';

    return {baseName, extension};
};

export function generateUniqueFileName(fileName, usedNames = []) {
    if (!usedNames || !usedNames.includes(fileName)) {
        return fileName;
    }

    const {baseName, extension} = getBaseNameAndExtension(fileName);
    let counter = 1;
    let newName = `${baseName} (${counter})${extension}`;

    while (usedNames.includes(newName)) {
        counter += 1;
        newName = `${baseName} (${counter})${extension}`;
    }

    return newName;
}

export const joinPaths = (...paths) => paths
    .map(p => (p && p !== PATH_SEPARATOR ? p : ''))
    .join(PATH_SEPARATOR);

export const addCounterToFilename = (fileName) => {
    const {baseName, extension} = getBaseNameAndExtension(fileName);

    // Verify if the filename already contains a counter
    // If so, update the counter in the filename
    const matchesCounter = baseName.match(/ \((\d+)\)$/);
    if (matchesCounter) {
        const newBaseName = baseName.substring(0, baseName.length - matchesCounter[0].length);
        const counter = parseInt(matchesCounter[1], 10) + 1;
        return `${newBaseName} (${counter})${extension}`;
    }

    return `${baseName} (${2})${extension}`;
};

export function getParentPath(path) {
    const pos = path.lastIndexOf('/', path.length - 2);
    return (pos > 1) ? path.substring(0, pos) : '';
}

export function getFileName(path) {
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

export const getPathInfoFromParams = ({collection, path}) => (
    {
        collectionLocation: collection,
        openedPath: `/${collection || ''}${path ? `/${path}` : ''}`
    }
);
