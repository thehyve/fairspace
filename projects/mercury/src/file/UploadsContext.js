import React, {useState} from 'react';
import FileAPI from "./FileAPI";
import ErrorDialog from "../common/components/ErrorDialog";

export const UPLOAD_STATUS_INITIAL = 'INITIAL';
export const UPLOAD_STATUS_IN_PROGRESS = 'IN_PROGRESS';
export const UPLOAD_STATUS_ERROR = 'ERROR';
export const UPLOAD_STATUS_FINISHED = 'FINISHED';

export type FileUpload = {
    id: string,
    files: any[],
    destinationPath: string
}

export const showCannotOverwriteDeletedError = (filesLength: number) => {
    const errorMessage = filesLength === 1 ? (
        "File or folder with this name already exists and was marked as deleted.\n"
        + "Please delete the existing one permanently, undelete it first\n"
        + "to be able to overwrite it or choose a unique name."
    ) : (
        "Some of the uploaded files or folders already exist and were marked as deleted.\n"
        + "Please delete the existing ones permanently, undelete them first \n"
        + "to be able to overwrite them or choose unique names."
    );
    ErrorDialog.showError(
        "Cannot overwrite deleted file or folder",
        errorMessage
    );
};

export const UploadsContext = React.createContext({});

export const UploadsProvider = ({children, fileApi = FileAPI}) => {
    const [uploads, setUploads] = useState([]);

    const updateSpecificUpload = (selected, updateFunc) => setUploads(
        currentUploads => currentUploads.map(upload => {
            if (upload.id === selected.id) {
                return updateFunc(upload);
            }

            return upload;
        })
    );

    const setStateForUpload = (selected, newState) => updateSpecificUpload(
        selected,
        upload => ({...upload, status: newState})
    );

    const removeUpload = upload => setUploads(
        currentUploads => [
            ...currentUploads.filter(u => u.id !== upload.id)
        ]
    );

    const enqueueUploads = newUpload => setUploads(
        currentUploads => [
            ...currentUploads,
            newUpload
        ]
    );

    const startUpload = (upload: FileUpload) => {
        const newUpload = {...upload, status: UPLOAD_STATUS_INITIAL, progress: 0};
        enqueueUploads(newUpload);
        const onUploadProgress = progressEvent => updateSpecificUpload(
            newUpload,
            u => ({...u, progress: (progressEvent.loaded * 100) / progressEvent.total})
        );
        setStateForUpload(newUpload, UPLOAD_STATUS_IN_PROGRESS);
        return fileApi.uploadMulti(newUpload.destinationPath, newUpload.files, onUploadProgress)
            .then(() => {
                setStateForUpload(newUpload, UPLOAD_STATUS_FINISHED);
                setTimeout(() => removeUpload(newUpload), 5000);
            })
            .catch((err) => {
                if (err && err.message && err.message.includes("Conflict")) {
                    showCannotOverwriteDeletedError(newUpload.files.length);
                }
                setStateForUpload(newUpload, UPLOAD_STATUS_ERROR);
            });
    };

    return (
        <UploadsContext.Provider
            value={{
                uploads,
                startUpload,
                removeUpload
            }}
        >
            {children}
        </UploadsContext.Provider>
    );
};

export default UploadsContext;
