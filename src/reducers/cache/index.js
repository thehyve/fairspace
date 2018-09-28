import {combineReducers} from 'redux'
import jsonLdBySubject from './jsonLdBySubject'
import vocabulary from "./vocabulary";
import entitiesByType from "./entitiesByType";

export default combineReducers({
    jsonLdBySubject,
    entitiesByType,
    vocabulary
})
