import {useCallback} from "react";
import {useAsync} from "../common";
import FileAPI from "./FileAPI";

/**
 * This hook contains logic about files for a certain directory.
 */
export const useFiles = (path, fileApi = FileAPI) => {
    const {loading, error, data = [], refresh} = useAsync(useCallback(
        () => fileApi.list(path), [path, fileApi]
    ));

    const {getDownloadLink} = fileApi;

    const createDirectory = directoryPath => fileApi
        .createDirectory(directoryPath)
        .then(refresh);

    const copyPaths = paths => fileApi
        .copyPaths(paths, path)
        .then(refresh);

    return {
        loading,
        error,
        files: data,
        refresh,
        fileActions: {
            createDirectory,
            getDownloadLink,
            copyPaths
        }
    };
};

export default useFiles;
