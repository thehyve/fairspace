import {useContext} from "react";
import {generateUniqueFileName} from "./fileUtils";
import UploadsContext, {UPLOAD_STATUS_INITIAL} from "./UploadsContext";

/**
 * This hook contains logic about uploads for a certain directory.
 */
export const disconnectedUseUploads = (path, existingFilenames, allUploads, enqueueUploads, startUpload, refreshFiles) => {
    const uploads = allUploads.filter(upload => upload.destinationPath === path);

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
        .map(upload => startUpload(upload).then(refreshFiles));

    return {
        enqueue,
        startAll,
        uploads
    };
};

const useUploads = (path, existingFilenames = [], refreshFiles) => {
    const {getUploads, enqueueUploads, startUpload} = useContext(UploadsContext);

    return disconnectedUseUploads(path, existingFilenames, getUploads(), enqueueUploads, startUpload, refreshFiles);
};

export default useUploads;
