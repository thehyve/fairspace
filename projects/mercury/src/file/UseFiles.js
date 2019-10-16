import {useCallback} from "react";
import {useAsync} from "@fairspace/shared-frontend";
import FileAPI from "./FileAPI";
import {joinPaths} from "../common/utils/fileUtils";

/**
 * This hook contains logic about files for a certain directory.
 */
export const useFiles = (path) => {
    const {loading, error, data, refresh} = useAsync(useCallback(
        () => FileAPI.list(path), [path]
    ));

    const {getDownloadLink} = FileAPI;

    const renameFile = (currentFilename, newFilename) => {
        const from = joinPaths(path, currentFilename);
        const to = joinPaths(path, newFilename);

        return FileAPI
            .move(from, to)
            .then(refresh);
    }

    const createDirectory = directoryPath => FileAPI
        .createDirectory(directoryPath)
        .then(refresh);

    const deleteMultiple = paths => FileAPI
        .deleteMultiple(paths)
        .then(refresh);

    const movePaths = paths => FileAPI
        .movePaths(paths, path)
        .then(refresh);

    const copyPaths = paths => FileAPI
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
