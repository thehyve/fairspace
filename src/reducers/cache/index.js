import {combineReducers} from 'redux'
import jsonLdBySubject from './jsonLdBySubject'
import vocabulary from "./vocabulary";
import entitiesByType from "./entitiesByType";
import collections from "./collections";
import filesByCollectionAndPath from "./filesByCollectionAndPath";
import users from "./users";
import allEntities from "./allEntities";

export default combineReducers({
    jsonLdBySubject,
    entitiesByType,
    users,
    allEntities,
    vocabulary,
    collections,
    filesByCollectionAndPath
})
