import {combineReducers} from 'redux'
import jsonLdBySubject from './jsonLdBySubject'
import vocabulary from "./vocabulary";
import entitiesByType from "./entitiesByType";
import collections from "./collections";
import filesByCollectionAndPath from "./filesByCollectionAndPath";

export default combineReducers({
    jsonLdBySubject,
    entitiesByType,
    vocabulary,
    collections,
    filesByCollectionAndPath
})
