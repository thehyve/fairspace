import {promiseReducerFactory} from "../../utils/redux";
import {FETCH_USER} from "../../actions/actionTypes";

export default promiseReducerFactory(FETCH_USER);
