import {createFetchPromiseReducer} from "../utils/redux";

const defaultState = {};
const jsonLdFetchReducer = createFetchPromiseReducer("METADATA_COMBINATION", defaultState, action => action.meta.subject);
const metadataBySubject = (state = defaultState, action) => {
    const reducedState = jsonLdFetchReducer(state, action);

    switch(action.type) {
        case "UPDATE_METADATA_FULFILLED":
            return {
                ...reducedState,
                [action.meta.subject]: {
                    ...reducedState[action.meta.subject],
                    data: reducedState[action.meta.subject].data.map(el => {
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
        default:
            return reducedState
    }
}

export default metadataBySubject;
