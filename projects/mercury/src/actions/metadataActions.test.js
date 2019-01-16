import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";
import {fetchJsonLdBySubjectIfNeeded} from "./metadataActions";
import Config from "../services/Config/Config";
import configFile from "../config";
import mockResponse from "../utils/mockResponse";
import {FETCH_METADATA} from "./actionTypes";

const subject = 'my-subject';
const middlewares = [thunk, promiseMiddleware()];
const mockStore = configureStore(middlewares);

beforeAll(() => {
    Config.setConfig(Object.assign(configFile, {
        externalConfigurationFiles: [],
    }));
    return Config.init();
});

describe('fetch metadata', () => {
    it('should fetch data if nothing is present', () => {
        const store = mockStore({});

        window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([{name: 'collection1'}]))));

        return store.dispatch(fetchJsonLdBySubjectIfNeeded(subject))
            .then(() => {
                const actions = store.getActions();
                expect(actions.length).toEqual(2);
                expect(actions[0].type).toEqual(`${FETCH_METADATA}_PENDING`);
                expect(actions[0].meta.subject).toEqual(subject);
                expect(actions[1].type).toEqual(`${FETCH_METADATA}_FULFILLED`);
                expect(actions[1].meta.subject).toEqual(subject);
            });
    });

    it('should not fetch data if data present', () => {
        const store = mockStore({
            cache: {
                jsonLdBySubject: {
                    [subject]: {
                        data: ['some-data']
                    }
                }
            }
        });

        return store.dispatch(fetchJsonLdBySubjectIfNeeded(subject))
            .then(() => {
                const actions = store.getActions();
                expect(actions.length).toEqual(0);
            });
    });

    it('should fetch data if an the data was invalidated', () => {
        const store = mockStore({
            cache: {
                jsonLdBySubject: {
                    [subject]: {
                        invalidated: true,
                        data: ['some-data']
                    }
                }
            }
        });

        window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([{name: 'collection1'}]))));

        return store.dispatch(fetchJsonLdBySubjectIfNeeded(subject))
            .then(() => {
                const actions = store.getActions();
                expect(actions.length).toEqual(2);
                expect(actions[0].type).toEqual(`${FETCH_METADATA}_PENDING`);
                expect(actions[0].meta.subject).toEqual(subject);
                expect(actions[1].type).toEqual(`${FETCH_METADATA}_FULFILLED`);
                expect(actions[1].meta.subject).toEqual(subject);
            });
    });

    it('should not fetch data if already fetching', () => {
        const store = mockStore({
            cache: {
                jsonLdBySubject: {
                    [subject]: {
                        pending: true,
                        invalidated: true
                    }
                }
            }
        });

        return store.dispatch(fetchJsonLdBySubjectIfNeeded(subject))
            .then(() => {
                const actions = store.getActions();
                expect(actions.length).toEqual(0);
            });
    });
});
