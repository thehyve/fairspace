import {combineReducers} from 'redux';
import jsonLdBySubject from './jsonLdBySubjectReducers';
import vocabulary from "./vocabularyReducers";
import metaVocabulary from "./metaVocabularyReducers";
import collections from "./collectionReducers";
import filesByPath from "./filesByPathReducers";
import fileInfoByPath from "./fileInfoByPathReducers";

export default combineReducers({
    jsonLdBySubject,

    vocabulary,

    metaVocabulary,
    collections,
    filesByPath,
    fileInfoByPath
});
