import {combineReducers} from 'redux';
import jsonLdBySubject from './jsonLdBySubjectReducers';
import vocabulary from "./vocabularyReducers";
import metaVocabulary from "./metaVocabularyReducers";

export default combineReducers({
    jsonLdBySubject,
    vocabulary,
    metaVocabulary
});
