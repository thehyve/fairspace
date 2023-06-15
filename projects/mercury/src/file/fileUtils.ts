// @ts-nocheck
/* eslint-disable import/no-cycle */
import { File } from "./FileAPI";
import { FILE_URI, PATH_SEPARATOR } from "../constants";
import { getCollectionAbsolutePath } from "../collections/collectionUtils";
import { getExternalStorageAbsolutePath } from "../external-storage/externalStorageUtils";
import type { ExternalStorage } from "../external-storage/externalStorageUtils";
const NON_SAFE_FILE_NAME_CHARACTERS = ['/', '\\'];
const NON_SAFE_FILE_NAMES = ['.', '..'];
export const getStrippedPath = path => {
  const stripped = path.startsWith(PATH_SEPARATOR) ? path.substring(1) : path;
  return path.endsWith(PATH_SEPARATOR) ? stripped.slice(0, -1) : stripped;
};
export const splitPathIntoArray = path => path.split(PATH_SEPARATOR).filter(s => s.length > 0);
export const joinPaths = (...paths) => paths.map(p => p && p !== PATH_SEPARATOR ? p : '').join(PATH_SEPARATOR);
export const joinPathsAvoidEmpty = (...paths) => {
  const strippedPaths = [];
  paths.forEach((path, index) => {
    if (index === 0) {
      if (paths.length === 1) {
        strippedPaths.push(path);
      } else {
        strippedPaths.push(path.endsWith(PATH_SEPARATOR) ? path.slice(0, -1) : path);
      }
    } else if (index === paths.length - 1) {
      strippedPaths.push(path.startsWith(PATH_SEPARATOR) ? path.substring(1) : path);
    } else {
      strippedPaths.push(getStrippedPath(path));
    }
  });
  return joinPaths(...strippedPaths);
};
export const getParentPath = (path: string) => {
  const pos = path.lastIndexOf(PATH_SEPARATOR, path.length - 2);
  return pos > 1 ? path.substring(0, pos) : '';
};
export const getPathFromIri = (iri: string, pathPrefix = "") => {
  const url = new URL(iri);
  const path = iri.replace(pathPrefix || url.origin + "/api/webdav/", '');
  const strippedPath = getStrippedPath(path);
  return decodeURIComponent(strippedPath);
};
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
export const encodePath = path => path.split(PATH_SEPARATOR).map(encodeURIComponent).join(PATH_SEPARATOR);
export const decodePath = path => path.split(PATH_SEPARATOR).map(decodeURIComponent).join(PATH_SEPARATOR);

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

export const getAbsolutePath = (path: string, storageName: string = "") => {
  if (storageName) {
    return getExternalStorageAbsolutePath(path, storageName);
  }

  return getCollectionAbsolutePath(path);
};
export const redirectLink = (iri: string, type: string, storage: ExternalStorage = {}) => {
  const path = getPathFromIri(iri, storage.rootDirectoryIri);

  if (type && type === FILE_URI) {
    const parentPath = getParentPath(path);
    return `${getAbsolutePath(parentPath, storage.name)}?selection=${encodeURIComponent(`${PATH_SEPARATOR}${path}`)}`;
  }

  return getAbsolutePath(path, storage.name);
};
export const getPathInfoFromParams = ({
  collection,
  path
}) => ({
  collectionName: decodeIfPossible(collection || ''),
  openedPath: `/${decodeIfPossible(collection || '')}${path ? `/${path.split(PATH_SEPARATOR).map(decodeIfPossible).join(PATH_SEPARATOR)}` : ''}`
});
export function getFileName(path) {
  const normalizedPath = path.endsWith(PATH_SEPARATOR) ? path.substring(0, path.length - 1) : path;
  const pos = normalizedPath.lastIndexOf(PATH_SEPARATOR);
  return pos > 0 ? normalizedPath.substring(pos + 1) : normalizedPath;
}
// the extension includes a dot in some cases and is empty in others. That will very much help in reusing logic
export const getBaseNameAndExtension = fileName => {
  if (!fileName) {
    return {
      baseName: '',
      extension: ''
    };
  }

  const dotPosition = fileName.lastIndexOf('.');
  const baseName = dotPosition > 0 ? fileName.substring(0, dotPosition) : fileName;
  const extension = dotPosition > 0 ? fileName.substring(dotPosition) : '';
  return {
    baseName,
    extension
  };
};
export function generateUniqueFileName(fileName, usedNames = []) {
  if (!usedNames || !usedNames.includes(fileName)) {
    return fileName;
  }

  const {
    baseName,
    extension
  } = getBaseNameAndExtension(fileName);
  let counter = 1;
  let newName = `${baseName} (${counter})${extension}`;

  while (usedNames.includes(newName)) {
    counter += 1;
    newName = `${baseName} (${counter})${extension}`;
  }

  return newName;
}
export const decodeHTMLEntities = (htmlSource: string) => {
  const element = document.createElement('textarea');
  element.innerHTML = htmlSource;
  return element.textContent;
};
export const isUnsafeFileName = fileName => NON_SAFE_FILE_NAMES.includes(fileName);
export const fileNameContainsInvalidCharacter = fileName => NON_SAFE_FILE_NAME_CHARACTERS.some(character => fileName.includes(character));
export const isValidFileName = fileName => {
  if (!fileName) {
    return false;
  }

  const name = fileName.trim();
  return name.length > 0 && !fileNameContainsInvalidCharacter(name) && !isUnsafeFileName(name);
};
export const isListOnlyFile = (file: File) => file && file.type === 'file' && file.access === "List";