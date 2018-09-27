const defaultState = { pending: false, error: false, items: [] };

const authorizations = (state = defaultState, action) => {
    switch (action.type) {
        case "AUTHORIZATIONS_PENDING":
            return {
                ...state,
                pending: true,
                error: false
            };
        case "AUTHORIZATIONS_FULFILLED":
            return {
                ...state,
                pending: false,
                items: action.payload
            };
        case "AUTHORIZATIONS_REJECTED":
            return {
                ...state,
                pending: false,
                error: action.payload || true
            };
        default:
            return state;
    }
};

export default authorizations;
