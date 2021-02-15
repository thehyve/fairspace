import {ExternalFileApi} from "../file/FileAPI";
import useAsync from "../common/hooks/UseAsync";


/**
 * This hook contains logic about files for a certain external storage.
 */
export const useExternalStorage = (path: string, storageURL: string, fileApi = ExternalFileApi(storageURL)) => {
    const {loading, error, data = [], refresh} = useAsync(
        () => fileApi.list(path),
        [path, storageURL]
    );

    const {getDownloadLink} = fileApi;

    return {
        loading,
        error,
        files: data,
        refresh,
        fileActions: {
            getDownloadLink
        }
    };
};
