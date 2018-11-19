import Config from "./Config";
import mockResponse from "../../utils/mockResponse";

const initialConfig = {
    "urls": {
        "collections": "/collections",
        "existing-item": "xyz",
        "otherConfig": {
            "items": ["a", "b"]
        }
    }
};

it('merges existing config with external config', () => {
    Config.setConfig(Object.assign({}, initialConfig, {"externalConfigurationFiles": [ "test" ]}));

    window.fetch = jest.fn(() =>
        Promise.resolve(mockResponse(200, 'OK', JSON.stringify({
            "urls": {
                "collections": "/new-collections-api",
                "otherConfig": {
                    "extra-item": 2,
                    "items": ["c", "d"]
                }
            }
        })))
    );

    const expectedConfig = {
        "externalConfigurationFiles": ["test"],
        "urls": {
            "collections": "/new-collections-api",
            "existing-item": "xyz",
            "otherConfig": {
                "extra-item": 2,
                "items": ["a", "b", "c", "d"]
            }
        }
    }

    expect(Config.init()).resolves.toEqual(expectedConfig);
});

it('performs no calls without external configuration files', () => {
    Config.setConfig(initialConfig);

    window.fetch = jest.fn(() =>
        Promise.resolve(mockResponse(200, 'OK', JSON.stringify({
            "urls": {
                "collections": "overwritten"
            }
        })))
    );

    expect(Config.init()).resolves.toEqual(initialConfig);
});
