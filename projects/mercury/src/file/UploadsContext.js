import React, {useEffect, useState} from 'react';
import {LocalFileAPI} from './FileAPI';
import ErrorDialog from '../common/components/ErrorDialog';
import {isValidFileName} from './fileUtils';
import {PATH_SEPARATOR} from '../constants';
import {ConfigResponse, getServerConfig} from '../status/StatusAPI';

export const UPLOAD_STATUS_INITIAL = 'INITIAL';
export const UPLOAD_STATUS_IN_PROGRESS = 'IN_PROGRESS';
export const UPLOAD_STATUS_ERROR = 'ERROR';
export const UPLOAD_STATUS_FINISHED = 'FINISHED';

export type File = {
    name: string;
    path?: string;
    lastModified: number;
    type: string;
    size: number;
}

export type FileUpload = {
    id: string,
    files: File[],
    destinationPath: string
}

export const showCannotOverwriteDeletedError = (filesLength: number) => {
    const errorMessage = filesLength === 1 ? (
        'File or folder with this name already exists and was marked as deleted.\n'
        + 'Please delete the existing one permanently, undelete it first\n'
        + 'to be able to overwrite it or choose a unique name.'
    ) : (
        'Some of the uploaded files or folders already exist and were marked as deleted.\n'
        + 'Please delete the existing ones permanently, undelete them first \n'
        + 'to be able to overwrite them or choose unique names.'
    );
    ErrorDialog.showError(
        'Cannot overwrite deleted file or folder',
        errorMessage
    );
};

export const showInvalidFilenames = (invalidFilenames) => {
    ErrorDialog.showError(
        'Invalid file name',
        <span>
            Invalid file {invalidFilenames.length === 1 ? 'name' : 'names'}: <em>{invalidFilenames.join(', ')}</em>.<br />
        </span>
    );
};

export const showFileTooLarge = (size: string) => {
    ErrorDialog.showError(
        'File too large',
        <span>
            File or folder exceeds the upload size limit: {size}.<br />
        </span>
    );
};

export const UploadsContext = React.createContext({});

export const UploadsProvider = ({children, fileApi = LocalFileAPI}) => {
    const [uploads, setUploads] = useState([]);
    const [maxFileSize, setMaxFileSize] = useState();
    const [maxFileSizeBytes, setMaxFileSizeBytes] = useState();

    const handleGetMaxFileSize = async () => getServerConfig()
        .then((response: ConfigResponse) => {
            if (response) {
                if (response.maxFileSize != null) {
                    setMaxFileSize(response.maxFileSize);
                }
                if (response.maxFileSizeBytes != null) {
                    setMaxFileSizeBytes(response.maxFileSizeBytes);
                }
            }
        })
        .catch(() => {
            setMaxFileSize(null);
        });

    useEffect(() => {
        handleGetMaxFileSize();
    }, []);

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
        const invalidFilenames = upload.files
            .map(file => {
                const parts = file.path.split(PATH_SEPARATOR);
                // eslint-disable-next-line no-restricted-syntax
                for (const part of parts) {
                    if (!isValidFileName(part)) {
                        return part;
                    }
                }
                return null;
            })
            .filter(fileName => !!fileName);
        if (invalidFilenames.length > 0) {
            showInvalidFilenames(invalidFilenames);
            setStateForUpload(upload, UPLOAD_STATUS_ERROR);
            return Promise.resolve();
        }
        const onUploadProgress = progressEvent => updateSpecificUpload(
            newUpload,
            u => ({...u, progress: (progressEvent.loaded * 100) / progressEvent.total})
        );
        setStateForUpload(newUpload, UPLOAD_STATUS_IN_PROGRESS);
        return fileApi.uploadMulti(newUpload.destinationPath, newUpload.files, maxFileSizeBytes, onUploadProgress)
            .then(() => {
                setStateForUpload(newUpload, UPLOAD_STATUS_FINISHED);
                setTimeout(() => removeUpload(newUpload), 5000);
            })
            .catch((err) => {
                if (err && err.message && err.message.includes('Conflict')) {
                    showCannotOverwriteDeletedError(newUpload.files.length);
                }
                if (err && err.message && err.message.includes('Payload too large')) {
                    showFileTooLarge(maxFileSize);
                }
                setStateForUpload(newUpload, UPLOAD_STATUS_ERROR);
            });
    };

    return (
        <UploadsContext.Provider
            value={{
                uploads,
                startUpload,
                removeUpload,
                maxFileSize
            }}
        >
            {children}
        </UploadsContext.Provider>
    );
};

export default UploadsContext;
