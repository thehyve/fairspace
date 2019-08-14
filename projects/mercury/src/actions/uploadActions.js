import * as actionTypes from "./actionTypes";
import FileAPI from "../services/FileAPI";

export const enqueueUploads = (uploads = []) => ({
    type: actionTypes.ENQUEUE_UPLOAD,
    uploads
});

export const uploadProgress = (upload, progress) => ({
    type: actionTypes.UPLOAD_FILE_PROGRESS,
    meta: {
        destinationPath: upload.destinationPath,
        destinationFilename: upload.destinationFilename,
        progress
    }
});

export const startUpload = upload => dispatch => {
    const onUploadProgress = progressEvent => dispatch(uploadProgress(upload, (progressEvent.loaded * 100) / progressEvent.total));

    return dispatch({
        type: actionTypes.UPLOAD_FILE,
        payload: FileAPI.upload(upload, onUploadProgress),
        meta: {
            destinationPath: upload.destinationPath,
            destinationFilename: upload.destinationFilename
        }
    });
};
