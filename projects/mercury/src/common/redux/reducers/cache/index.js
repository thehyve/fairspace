import {combineReducers} from 'redux';
import jsonLdBySubject from './jsonLdBySubjectReducers';
import vocabulary from "./vocabularyReducers";

export default combineReducers({
    jsonLdBySubject,
    vocabulary
});
