const defaultState = {};

const metadataBySubject = (state = defaultState, action) => {
    switch (action.type) {
        case "METADATA_COMBINATION_FULFILLED":
            return {
                ...state,
                [action.meta.subject]: {
                    pending: false,
                    error: false,
                    invalidated: false,
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
        case "UPDATE_METADATA_FULFILLED":
            return {
                ...state,
                [action.meta.subject]: {
                    ...state[action.meta.subject],
                    items: state[action.meta.subject].items.map(el => {
                        if(el.key !== action.meta.predicate) {
                            return el;
                        }

                        return {
                            ...el,
                            values: action.meta.values
                        }
                    }),
                    invalidated: true
                }
            }
        case "INVALIDATE_METADATA":
            return {
                ...state,
                [action.meta.subject]: {
                    ...state[action.meta.subject],
                    invalidated: true
                }
            }
        default:
            return state;
    }
};

export default metadataBySubject;
