import {combineReducers} from 'redux';
import jsonLdBySubject from './jsonLdBySubjectReducers';
import vocabulary from "./vocabularyReducers";
import metaVocabulary from "./metaVocabularyReducers";
import entitiesByType from "./entitiesByTypeReducers";
import collections from "./collectionReducers";
import filesByPath from "./filesByPathReducers";
import users from "./usersReducers";
import allEntities from "./allEntitiesReducers";
import subjectByPath from "./subjectByPathReducers";
import permissionsByIri from "./permissionsByIriReducers";

export default combineReducers({
    jsonLdBySubject,
    entitiesByType,
    users,
    allEntities,
    vocabulary,
    metaVocabulary,
    collections,
    filesByPath,
    subjectByPath,
    permissionsByIri
});
