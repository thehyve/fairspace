import Config from "../Config";
import {mockResponse} from "../../../utils/testUtils";

const initialConfig = {
    urls: {
        "collections": "/collections",
        "existing-item": "xyz",
        "otherConfig": {
            items: ["a", "b"]
        }
    }
};

it('merges existing config with external config', () => {
    Config.setConfig(Object.assign({}, initialConfig, {externalConfigurationFiles: ["test"]}));

    window.fetch = jest.fn(() => Promise.resolve(mockResponse(JSON.stringify({
        urls: {
            collections: "/new-collections-api",
            otherConfig: {
                "extra-item": 2,
                "items": ["c", "d"]
            }
        }
    }))));

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
});

// The test are actually affected by each other, making the 2nd one fails (silently).
// To confirm this just await the expect method.
// One idea to improve the implementation and tests of the Config files is to make it a custom hook.
// But this require that all other files using it (APIs, redux actions) to be custom hooks or function based components
it('performs no calls without external configuration files', () => {
    Config.setConfig(initialConfig);

    window.fetch = jest.fn(() => Promise.resolve(mockResponse(JSON.stringify({
        urls: {
            collections: "overwritten"
        }
    }))));

    expect(Config.init()).resolves.toEqual(initialConfig);
});
