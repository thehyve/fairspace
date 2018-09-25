import mockStore from "../store/mockStore";
import {fetchJsonLdBySubjectIfNeeded} from "./metadata";
import Config from "../components/generic/Config/Config";
import configFile from "../config";
import mockResponse from "../utils/mockResponse";

const subject = 'my-subject';

beforeAll(() => {

    Config.setConfig(Object.assign(configFile, {
        "externalConfigurationFiles": [],
    }));
    return Config.init();

});

describe('fetch metadata', () => {
    it('should fetch data if nothing is present', () => {
        const store = mockStore({});

        window.fetch = jest.fn(() =>
            Promise.resolve(mockResponse(200, 'OK', JSON.stringify([{'name': 'collection1'}]))))

        return store.dispatch(fetchJsonLdBySubjectIfNeeded(subject))
            .then(() => {
                const actions = store.getActions();
                expect(actions.length).toEqual(2);
                expect(actions[0].type).toEqual('METADATA_PENDING');
                expect(actions[0].meta.subject).toEqual(subject);
                expect(actions[1].type).toEqual('METADATA_FULFILLED');
                expect(actions[1].meta.subject).toEqual(subject);
            })
    })

    it('should not fetch data if data present', () => {
        const store = mockStore({ cache: { jsonLdBySubject: {
                    [subject]: {
                        items: ['some-data']
                    }
                }}});

        return store.dispatch(fetchJsonLdBySubjectIfNeeded(subject))
            .then(() => {
                const actions = store.getActions();
                expect(actions.length).toEqual(0);
            });

    })

    it('should fetch data if an the data was invalidated', () => {
        const store = mockStore({ cache: { jsonLdBySubject: {
            [subject]: {
                invalidated: true,
                items: ['some-data']
            }
        }}});

        window.fetch = jest.fn(() =>
            Promise.resolve(mockResponse(200, 'OK', JSON.stringify([{'name': 'collection1'}]))))

        return store.dispatch(fetchJsonLdBySubjectIfNeeded(subject))
            .then(() => {
                const actions = store.getActions();
                expect(actions.length).toEqual(2);
                expect(actions[0].type).toEqual('METADATA_PENDING');
                expect(actions[0].meta.subject).toEqual(subject);
                expect(actions[1].type).toEqual('METADATA_FULFILLED');
                expect(actions[1].meta.subject).toEqual(subject);
            })
    })

    it('should not fetch data if already fetching', () => {
        const store = mockStore({ cache: { jsonLdBySubject: {
                    [subject]: {
                        pending: true,
                        invalidated: true
                    }
                }}});

        return store.dispatch(fetchJsonLdBySubjectIfNeeded(subject))
            .then(() => {
                const actions = store.getActions();
                expect(actions.length).toEqual(0);
            });
    })
});
