import * as actionTypes from '../actions/actionTypes';

export const UPLOAD_STATUS_INITIAL = 'INITIAL';
export const UPLOAD_STATUS_IN_PROGRESS = 'IN_PROGRESS';
export const UPLOAD_STATUS_ERROR = 'ERROR';
export const UPLOAD_STATUS_FINISHED = 'FINISHED';

const updateSpecificUpload = (uploads, selected, updateFunc) => uploads.map(upload => {
    if (upload.destinationPath === selected.destinationPath && upload.destinationFilename === selected.destinationFilename) {
        return updateFunc(upload);
    }

    return upload;
});

const setStateForUpload = (uploads, selected, newState) => updateSpecificUpload(
    uploads,
    selected,
    upload => ({...upload, status: newState})
);

export default (state = [], action) => {
    switch (action.type) {
        case actionTypes.ENQUEUE_UPLOAD:
            return [
                ...state,
                ...action.uploads.map(upload => ({...upload, status: UPLOAD_STATUS_INITIAL, progress: 0}))
            ];
        case actionTypes.UPLOAD_FILE_PENDING:
            return setStateForUpload(state, action.meta, UPLOAD_STATUS_IN_PROGRESS);
        case actionTypes.UPLOAD_FILE_PROGRESS:
            return updateSpecificUpload(state, action.meta, upload => ({...upload, progress: action.meta.progress}));
        case actionTypes.UPLOAD_FILE_FULFILLED:
            return setStateForUpload(state, action.meta, UPLOAD_STATUS_FINISHED);
        case actionTypes.UPLOAD_FILE_REJECTED:
            return setStateForUpload(state, action.meta, UPLOAD_STATUS_ERROR);
        default:
            return state;
    }
};
