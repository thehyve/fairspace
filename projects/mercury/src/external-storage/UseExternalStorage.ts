// @ts-nocheck
import useAsync from "../common/hooks/UseAsync";
import FileAPI from "../file/FileAPI";

/**
 * This hook contains logic about files for a certain external storage.
 */
export const useExternalStorage = (path: string, storageURL: string, fileApi = new FileAPI(storageURL)) => {
  const {
    loading,
    error,
    data = [],
    refresh
  } = useAsync(() => fileApi.list(path), [path, storageURL]);
  const {
    getDownloadLink,
    open
  } = fileApi;
  return {
    loading,
    error,
    files: data,
    refresh,
    fileActions: {
      getDownloadLink,
      open
    }
  };
};