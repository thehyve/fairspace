import * as actionTypes from "./actionTypes";
import FileAPI from "../services/FileAPI";

export const enqueueUploads = (uploads = []) => ({
    type: actionTypes.ENQUEUE_UPLOAD,
    uploads
});

export const startUpload = upload => ({
    type: actionTypes.UPLOAD_FILE,
    payload: FileAPI.upload(upload),
    meta: {
        destinationPath: upload.destinationPath,
        destinationFilename: upload.destinationFilename
    }
});
