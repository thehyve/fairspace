import {PATH_SEPARATOR} from "../constants";

const NON_SAFE_FILE_NAME_CHARACTER = '/';
const NON_SAFE_FILE_NAMES = ['.', '..'];

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

export function getParentPath(path) {
    const pos = path.lastIndexOf('/', path.length - 2);
    return (pos > 1) ? path.substring(0, pos) : '';
}

export function getFileName(path) {
    const normalizedPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
    const pos = normalizedPath.lastIndexOf('/');
    return (pos > 0) ? normalizedPath.substring(pos + 1) : normalizedPath;
}

export const encodePath = (path) => path.split(PATH_SEPARATOR).map(encodeURIComponent).join(PATH_SEPARATOR);

export const decodePath = (path) => path.split(PATH_SEPARATOR).map(decodeURIComponent).join(PATH_SEPARATOR);

export const getPathInfoFromParams = ({collection, path}) => (
    {
        collectionName: collection,
        openedPath: `/${collection || ''}${path ? `/${decodePath(path)}` : ''}`
    }
);

export const isValidFileName = (fileName) => (
    fileName.indexOf(NON_SAFE_FILE_NAME_CHARACTER) === -1
        && !NON_SAFE_FILE_NAMES.includes(fileName)
);
