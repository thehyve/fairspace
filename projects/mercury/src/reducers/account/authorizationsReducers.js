import {promiseReducerFactory} from "../../utils/redux";
import {FETCH_AUTHORIZATIONS} from "../../actions/actionTypes";

export default promiseReducerFactory(FETCH_AUTHORIZATIONS);
