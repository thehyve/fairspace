const defaultState = {};

const entitiesByType = (state = defaultState, action) => {
    switch (action.type) {
        case "METADATA_ENTITIES_FULFILLED":
            return {
                ...state,
                [action.meta.type]: {
                    pending: false,
                    error: false,
                    invalidated: false,
                    items: action.payload
                }
            }
        case "METADATA_ENTITIES_PENDING":
            return {
                ...state,
                [action.meta.type]: {
                    pending: true,
                    error: false,
                    items: {}
                }
            }
        case "METADATA_ENTITIES_REJECTED":
            return {
                ...state,
                [action.meta.type]: {
                    ...state[action.meta.type],
                    pending: false,
                    error: action.payload || true
                }
            }
        case "INVALIDATE_METADATA_ENTITIES":
            return {
                ...state,
                [action.meta.type]: {
                    ...state[action.meta.type],
                    invalidated: true
                }
            }
        default:
            return state;
    }
};

export default entitiesByType;
