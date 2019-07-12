import {combineReducers} from 'redux';
import jsonLdBySubject from './jsonLdBySubjectReducers';
import vocabulary from "./vocabularyReducers";
import vocabularyEntitiesByType from "./vocabularyEntitiesByTypeReducers";
import allVocabularyEntities from "./allVocabularyEntitiesReducers";
import metaVocabulary from "./metaVocabularyReducers";
import collections from "./collectionReducers";
import filesByPath from "./filesByPathReducers";
import fileInfoByPath from "./fileInfoByPathReducers";

export default combineReducers({
    jsonLdBySubject,

    vocabulary,
    vocabularyEntitiesByType,
    allVocabularyEntities,

    metaVocabulary,
    collections,
    filesByPath,
    fileInfoByPath
});
