import reducer from './vocabularyReducers';
import {testNoChangedOnUnknownActionType} from '../../utils/testUtils';

testNoChangedOnUnknownActionType('Vocabulary reducers', reducer);
