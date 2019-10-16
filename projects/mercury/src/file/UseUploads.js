import {useContext} from "react";
import {generateUniqueFileName} from "../common/utils/fileUtils";
import UploadsContext, {UPLOAD_STATUS_INITIAL} from "../common/contexts/UploadsContext";

/**
 * This hook contains logic about uploads for a certain directory.
 *
 * Information about uploaded files is stored in redux
 */
export const disconnectedUseUploads = (path, existingFilenames, uploads, enqueueUploads, startUpload) => {
    // Create a list of used filenames, including the current uploads
    const usedFilenames = existingFilenames.concat(uploads.map(upload => upload.destinationFilename));

    const enqueue = files => enqueueUploads(
        files.map(file => ({
            file,
            destinationFilename: generateUniqueFileName(file.name, usedFilenames),
            destinationPath: path
        }))
    );

    const startAll = () => uploads
        .filter(upload => upload.status === UPLOAD_STATUS_INITIAL)
        .map(upload => startUpload(upload));

    return {
        enqueue,
        startAll,
        uploads
    };
};

const useUploads = (path, existingFilenames = []) => {
    const {getUploadsForPath, enqueueUploads, startUpload} = useContext(UploadsContext);
    const uploads = getUploadsForPath(path);

    return disconnectedUseUploads(path, existingFilenames, uploads, enqueueUploads, startUpload);
};

export default useUploads;
