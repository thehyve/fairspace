const defaultState = { pending: false, error: false, item: {} };

const user = (state = defaultState, action) => {
    switch (action.type) {
        case "USER_PENDING":
            return {
                ...state,
                pending: true,
                error: false
            };
        case "USER_FULFILLED":
            return {
                ...state,
                pending: false,
                item: action.payload
            };
        case "USER_REJECTED":
            return {
                ...state,
                pending: false,
                error: action.payload || true
            };
        default:
            return state;
    }
};

export default user;
