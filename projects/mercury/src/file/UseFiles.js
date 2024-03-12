import {LocalFileAPI} from "./FileAPI";
import {joinPaths} from "./fileUtils";
import useAsync from "../common/hooks/UseAsync";

/**
 * This hook contains logic about files for a certain directory.
 */
export const useFiles = (path, showDeleted = false, fileApi = LocalFileAPI) => {
    const {loading, error, data = [], refresh} = useAsync(
        () => fileApi.list(path, showDeleted),
        [path, showDeleted, fileApi]
    );

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
        .deleteMultiple(paths, showDeleted)
        .then(refresh);

    const undeleteMultiple = paths => fileApi
        .undeleteMultiple(paths)
        .then(refresh);

    const movePaths = paths => fileApi
        .movePaths(paths, path)
        .then(refresh);

    const copyPaths = paths => fileApi
        .copyPaths(paths, path)
        .then(refresh);

    const showFileHistory = file => fileApi
        .showFileHistory(file.filename)
        .then(refresh);

    const revertToVersion = (file, versionToRevert) => fileApi
        .revertToVersion(file.filename, versionToRevert)
        .then(refresh);

    return {
        loading,
        error,
        files: data,
        refresh,
        fileActions: {
            createDirectory,
            deleteMultiple,
            undeleteMultiple,
            getDownloadLink,
            movePaths,
            renameFile,
            copyPaths,
            showFileHistory,
            revertToVersion
        }
    };
};
