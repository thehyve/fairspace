import {createFetchPromiseReducer} from "../../utils/redux";

const defaultState = {};
const jsonLdFetchReducer = createFetchPromiseReducer("METADATA", defaultState, action => action.meta.subject);
const jsonLdBySubject = (state = defaultState, action) => {
    const reducedState = jsonLdFetchReducer(state, action);

    switch(action.type) {
        case "UPDATE_METADATA_FULFILLED":
            return {
                ...reducedState,
                [action.meta.subject]: {
                    ...reducedState[action.meta.subject],
                    invalidated: true
                }
            }
        default:
            return reducedState
    }
}

export default jsonLdBySubject;
