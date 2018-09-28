import {promiseReducerFactory} from "../../utils/redux";

export default promiseReducerFactory("METADATA_ENTITIES", {}, action => action.meta.type);
