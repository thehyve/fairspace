import {promiseReducerFactory} from "../../../utils/redux";

import * as actionTypes from '../../actions/actionTypes';

export default promiseReducerFactory(actionTypes.FETCH_META_VOCABULARY, {invalidated: true, data: []});
