const defaultState = {};

const metadataBySubject = (state = defaultState, action) => {
    switch (action.type) {
        case "METADATA_COMBINATION_FULFILLED":
            return {
                ...state,
                [action.meta.subject]: {
                    pending: false,
                    error: false,
                    items: action.payload
                }
            }
        case "METADATA_COMBINATION_PENDING":
            return {
                ...state,
                [action.meta.subject]: {
                    pending: true,
                    error: false,
                    items: {}
                }
            }
        case "METADATA_COMBINATION_REJECTED":
            return {
                ...state,
                [action.meta.subject]: {
                    ...state[action.meta.subject],
                    pending: false,
                    error: action.payload || true
                }
            }
        case "INVALIDATE_METADATA":
            return {
                ...state,
                [action.subject]: null
            }
        default:
            return state;
    }
};

export default metadataBySubject;
