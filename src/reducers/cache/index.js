import {combineReducers} from 'redux'
import jsonLdBySubject from './jsonLdBySubject'
import vocabulary from "./vocabulary";
import entitiesByType from "./entitiesByType";
import collections from "./collections";
import filesByCollectionAndPath from "./filesByCollectionAndPath";
import allEntities from "./allEntities";

export default combineReducers({
    jsonLdBySubject,
    entitiesByType,
    allEntities,
    vocabulary,
    collections,
    filesByCollectionAndPath
})
