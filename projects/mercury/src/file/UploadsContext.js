import React, {useState} from 'react';
import FileAPI from "./FileAPI";

export const UPLOAD_STATUS_INITIAL = 'INITIAL';
export const UPLOAD_STATUS_IN_PROGRESS = 'IN_PROGRESS';
export const UPLOAD_STATUS_ERROR = 'ERROR';
export const UPLOAD_STATUS_FINISHED = 'FINISHED';

export const UploadsContext = React.createContext({});

export const UploadsProvider = ({children, fileApi = FileAPI}) => {
    const [uploads, setUploads] = useState([]);

    const updateSpecificUpload = (selected, updateFunc) => setUploads(
        currentUploads => currentUploads.map(upload => {
            if (upload.destinationPath === selected.destinationPath && upload.destinationFilename === selected.destinationFilename) {
                return updateFunc(upload);
            }

            return upload;
        })
    );

    const setStateForUpload = (selected, newState) => updateSpecificUpload(
        selected,
        upload => ({...upload, status: newState})
    );

    const enqueueUploads = newUploads => setUploads(
        currentUploads => [
            ...currentUploads,
            ...newUploads.map(upload => ({...upload, status: UPLOAD_STATUS_INITIAL, progress: 0}))
        ]
    );

    const startUpload = upload => {
        const onUploadProgress = progressEvent => updateSpecificUpload(
            upload,
            u => ({...u, progress: (progressEvent.loaded * 100) / progressEvent.total})
        );
        setStateForUpload(upload, UPLOAD_STATUS_IN_PROGRESS);
        return fileApi.uploadMulti(upload.destinationPath, [upload.file], onUploadProgress)
            .then(() => setStateForUpload(upload, UPLOAD_STATUS_FINISHED))
            .catch(() => setStateForUpload(upload, UPLOAD_STATUS_ERROR));
    };

    const getUploads = () => uploads;

    return (
        <UploadsContext.Provider
            value={{
                getUploads,
                enqueueUploads,
                startUpload
            }}
        >
            {children}
        </UploadsContext.Provider>
    );
};

export default UploadsContext;
