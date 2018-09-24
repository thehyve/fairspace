import {combineReducers} from 'redux'
import jsonLdBySubject from './jsonLdBySubject'
import vocabulary from "./vocabulary";

export default combineReducers({
    jsonLdBySubject,
    vocabulary
})
