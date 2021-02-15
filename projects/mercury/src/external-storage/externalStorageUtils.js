import {encodePath} from "../file/fileUtils";
import * as consts from "../constants";

export type ExternalStorage = {
    url: string,
    name: string,
    label: string
}

export const getExternalStoragePathPrefix = (storageName: string) => (
    consts.PATH_SEPARATOR + "external-storages" + consts.PATH_SEPARATOR + storageName
);

export const getExternalStorageAbsolutePath = (path: string, storageName: string) => (
    `${getExternalStoragePathPrefix(storageName)}${encodePath(path)}`
);

export const getRelativePath = (absolutePath: string, storageName: string) => (
    absolutePath.replace(getExternalStoragePathPrefix(storageName), '')
);
