import {FETCH_USERS} from "../../actions/actionTypes";
import {promiseReducerFactory} from "../../utils/redux";

export default promiseReducerFactory(FETCH_USERS, null);
