import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import * as actionTypes from "../../actions/actionTypes";

const defaultState = {invalidated: true, data: []};

export const vocabularyCreateReducer = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CREATE_VOCABULARY_ENTITY_FULFILLED: {
            const metadata = {'@id': action.meta.subject, '@type': [action.meta.type]};
            return {
                ...state,
                data: [...state.data, metadata],
                invalidated: true,
            };
        }
        default:
            return state;
    }
};

const fetchAllVocabularyEntitiesReducer = promiseReducerFactory(actionTypes.FETCH_ALL_VOCABULARY_ENTITIES, defaultState);

export default reduceReducers(fetchAllVocabularyEntitiesReducer, vocabularyCreateReducer);
