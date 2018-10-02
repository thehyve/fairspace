import {promiseReducerFactory} from "../../utils/redux";
import {METADATA_ENTITIES} from "../../actions/actionTypes";

export default promiseReducerFactory(METADATA_ENTITIES, {}, action => action.meta.type);
