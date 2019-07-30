import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";
import mockAxios from 'axios';

import Config from "../../services/Config/Config";
import configFile from "../../config";
import {UPDATE_COLLECTION} from "../actionTypes";
import {updateCollection} from "../collectionActions";

const middlewares = [thunk, promiseMiddleware];
const mockStore = configureStore(middlewares);

beforeAll(() => {
    Config.setConfig(Object.assign(configFile, {
        externalConfigurationFiles: [],
    }));
    return Config.init();
});

describe('Update metadata', () => {
    it('should return an error if updating a collection fails', () => {
        const store = mockStore({});

        mockAxios.patch.mockImplementationOnce(() => Promise.reject());

        return store.dispatch(updateCollection(1, "collection", "description", "location"))
            .then(() => {
                // The action should not succeed
                expect(true).toEqual(false);
            })
            .catch(() => {
                const actions = store.getActions();
                expect(actions.length).toEqual(2);
                expect(actions[0].type).toEqual(`${UPDATE_COLLECTION}_PENDING`);
                expect(actions[1].type).toEqual(`${UPDATE_COLLECTION}_REJECTED`);
            });
    });
});
