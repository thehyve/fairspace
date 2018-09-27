import {createFetchPromiseReducer} from "../../utils/redux";

export default createFetchPromiseReducer("METADATA_ENTITIES", {}, action => action.meta.type);
