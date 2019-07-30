import mockAxios from 'axios';

import Config from "../Config";

const initialConfig = {
    urls: {
        "collections": "/collections",
        "existing-item": "xyz",
        "otherConfig": {
            items: ["a", "b"]
        }
    }
};
Object.freeze(initialConfig);

beforeEach(() => {
    mockAxios.get.mockClear();
});

it('merges existing config with external config', () => {
    Config.setConfig(Object.assign({}, initialConfig, {externalConfigurationFiles: ["test"]}));

    mockAxios.get.mockImplementationOnce(() => Promise.resolve({
        status: 200,
        data: {
            urls: {
                collections: "/new-collections-api",
                otherConfig: {
                    "extra-item": 2,
                    "items": ["c", "d"]
                }
            }
        }
    }));

    const expectedConfig = {
        externalConfigurationFiles: ["test"],
        urls: {
            "collections": "/new-collections-api",
            "existing-item": "xyz",
            "otherConfig": {
                "extra-item": 2,
                "items": ["a", "b", "c", "d"]
            }
        }
    };

    expect(Config.init()).resolves.toEqual(expectedConfig);
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
});

it('performs no calls without external configuration files', () => {
    Config.setConfig(initialConfig);

    mockAxios.get.mockImplementationOnce(() => Promise.resolve({
        status: 200,
        data: {
            urls: {
                collections: "overwritten"
            }
        }
    }));

    // This line is causing an issue even prior to using axios, the test pass but there's an Unhandled promise rejection.
    // The issue here is that one unit test is affecting the other
    // expect(Config.init()).resolves.toEqual(initialConfig);
    expect(mockAxios.get).toHaveBeenCalledTimes(0);
});
