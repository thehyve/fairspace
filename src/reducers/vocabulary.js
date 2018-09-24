const vocabulary = (state = null, action) => {
    switch (action.type) {
        case "METADATA_VOCABULARY_PENDING":
            return {
                ...state,
                pending: true,
                error: false
            };
        case "METADATA_VOCABULARY_FULFILLED":
            return {
                ...state,
                pending: false,
                item: action.payload
            };
        case "METADATA_VOCABULARY_REJECTED":
            return {
                ...state,
                pending: false,
                error: action.payload || true
            };
        default:
            return state;
    }
};

export default vocabulary;
