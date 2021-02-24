// eslint-disable-next-line import/no-cycle
import {File} from "./FileAPI";
import {PATH_SEPARATOR} from "../constants";

const NON_SAFE_FILE_NAME_CHARACTERS = ['/', '\\'];
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
    const pos = path.lastIndexOf(PATH_SEPARATOR, path.length - 2);
    return (pos > 1) ? path.substring(0, pos) : '';
}

export function getFileName(path) {
    const normalizedPath = path.endsWith(PATH_SEPARATOR) ? path.substring(0, path.length - 1) : path;
    const pos = normalizedPath.lastIndexOf(PATH_SEPARATOR);
    return (pos > 0) ? normalizedPath.substring(pos + 1) : normalizedPath;
}

export const encodePath = (path) => path.split(PATH_SEPARATOR).map(encodeURIComponent).join(PATH_SEPARATOR);

export const decodePath = (path) => path.split(PATH_SEPARATOR).map(decodeURIComponent).join(PATH_SEPARATOR);

export const decodeHTMLEntities = (htmlSource: string) => {
    const element = document.createElement('textarea');
    element.innerHTML = htmlSource;
    return element.textContent;
};

/**
 * Workaround for a bug in 'history', see
 * FileBrowser#handlePathDoubleClick.
 */
const decodeIfPossible = segment => {
    try {
        return decodeURIComponent(segment);
    } catch (e) {
        return segment;
    }
};

export const getPathInfoFromParams = ({collection, path}) => (
    {
        collectionName: decodeIfPossible(collection || ''),
        openedPath: `/${decodeIfPossible(collection || '')}${path
            ? `/${path.split(PATH_SEPARATOR).map(decodeIfPossible).join(PATH_SEPARATOR)}` : ''}`
    }
);

export const getPathHierarchy = (fullPath, skipRootFolder = true) => {
    if (!fullPath) return [];

    const paths = [];
    let path = fullPath;
    while (path && path.lastIndexOf(PATH_SEPARATOR) > 0) {
        paths.push(path);
        path = path.substring(0, path.lastIndexOf(PATH_SEPARATOR));
    }
    if (!skipRootFolder) {
        paths.push(path);
    }
    return paths.reverse();
};

export const isUnsafeFileName = (fileName) => NON_SAFE_FILE_NAMES.includes(fileName);

export const fileNameContainsInvalidCharacter = (fileName) => NON_SAFE_FILE_NAME_CHARACTERS.some(character => fileName.includes(character));

export const isValidFileName = (fileName) => {
    if (!fileName) {
        return false;
    }
    const name = fileName.trim();
    return name.length > 0
        && !fileNameContainsInvalidCharacter(name)
        && !isUnsafeFileName(name);
};

export const isListOnlyFile = (file: File) => file && file.type === 'file' && file.access === "List";
