import {useCallback} from "react";
import {useAsync} from "@fairspace/shared-frontend";
import FileAPI from "./FileAPI";
import {joinPaths} from "../common/utils/fileUtils";

/**
 * This hook contains logic about files for a certain directory.
 */
export const useFiles = (path, fileApi = FileAPI) => {
    const {loading, error, data = [], refresh} = useAsync(useCallback(
        () => fileApi.list(path), [path, fileApi]
    ));

    const {getDownloadLink} = fileApi;

    const renameFile = (currentFilename, newFilename) => {
        const from = joinPaths(path, currentFilename);
        const to = joinPaths(path, newFilename);

        return fileApi
            .move(from, to)
            .then(refresh);
    };

    const createDirectory = directoryPath => fileApi
        .createDirectory(directoryPath)
        .then(refresh);

    const deleteMultiple = paths => fileApi
        .deleteMultiple(paths)
        .then(refresh);

    const movePaths = paths => fileApi
        .movePaths(paths, path)
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
            deleteMultiple,
            getDownloadLink,
            renameFile,
            movePaths,
            copyPaths
        }
    };
};

export default useFiles;
