import {combineReducers} from 'redux';
import jsonLdBySubject from './jsonLdBySubjectReducers';
import entitiesByType from "./entitiesByTypeReducers";
import allEntities from "./allEntitiesReducers";
import vocabulary from "./vocabularyReducers";
import vocabularyEntitiesByType from "./vocabularyEntitiesByTypeReducers";
import allVocabularyEntities from "./allVocabularyEntitiesReducers";
import metaVocabulary from "./metaVocabularyReducers";
import collections from "./collectionReducers";
import filesByPath from "./filesByPathReducers";
import users from "./usersReducers";
import subjectByPath from "./subjectByPathReducers";
import permissionsByIri from "./permissionsByIriReducers";

export default combineReducers({
    jsonLdBySubject,
    entitiesByType,
    allEntities,

    vocabulary,
    vocabularyEntitiesByType,
    allVocabularyEntities,

    metaVocabulary,
    users,
    collections,
    filesByPath,
    subjectByPath,
    permissionsByIri
});
