import {combineReducers} from 'redux';
import jsonLdBySubject from './jsonLdBySubjectReducers';
import vocabulary from "./vocabularyReducers";
import entitiesByType from "./entitiesByTypeReducers";
import collections from "./collectionReducers";
import filesByPath from "./filesByPathReducers";
import users from "./usersReducers";
import allEntities from "./allEntitiesReducers";
import subjectByPath from "./subjectByPathReducers";
import permissionsByCollection from "./permissionsByCollectionReducers";

export default combineReducers({
    jsonLdBySubject,
    entitiesByType,
    users,
    allEntities,
    vocabulary,
    collections,
    filesByPath,
    subjectByPath,
    permissionsByCollection
});
