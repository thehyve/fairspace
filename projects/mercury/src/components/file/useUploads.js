import {useDispatch, useSelector} from "react-redux";
import {enqueueUploads, startUpload} from "../../actions/uploadActions";
import {generateUniqueFileName} from "../../utils/fileUtils";
import {UPLOAD_STATUS_INITIAL} from "../../reducers/uploadsReducers";

/**
 * This hook contains logic about uploads for a certain directory.
 *
 * Information about uploaded files is stored in redux
 */
export const disconnectedUseUploads = (path, existingFilenames, uploads, dispatch) => {
    // Create a list of used filenames, including the current uploads
    const usedFilenames = existingFilenames.concat(uploads.map(upload => upload.destinationFilename));

    const enqueue = files => dispatch(enqueueUploads(
        files.map(file => ({
            file,
            destinationFilename: generateUniqueFileName(file.name, usedFilenames),
            destinationPath: path
        }))
    ));

    const startAll = () => uploads
        .filter(upload => upload.status === UPLOAD_STATUS_INITIAL)
        .map(upload => dispatch(startUpload(upload)));

    return {
        enqueue,
        startAll,
        uploads
    };
};

const useUploads = (path, existingFilenames = []) => {
    const uploads = useSelector(state => state.uploads.filter(upload => upload.destinationPath === path));
    const dispatch = useDispatch();

    return disconnectedUseUploads(path, existingFilenames, uploads, dispatch);
};

export default useUploads;
