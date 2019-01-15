import {promiseReducerFactory} from "../../utils/redux";
import {FETCH_METADATA_VOCABULARY} from "../../actions/actionTypes";

export default promiseReducerFactory(FETCH_METADATA_VOCABULARY, null);
