import {testNoChangedOnUnknownActionType} from "@fairspace/shared-frontend";
import reducer from '../vocabularyReducers';

testNoChangedOnUnknownActionType('vocabularyUtils reducers', reducer);
