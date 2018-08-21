import MetadataStore from "./MetadataStore";
import Config from "../../components/generic/Config/Config";

const mockResponse = (status, statusText, response) => {
    return new window.Response(response, {
        status: status,
        statusText: statusText,
        headers: {
            'Content-type': 'application/json'
        }
    });
};

beforeAll(() => {
    Config.setConfig({
        "urls": {
            "metadata": "/metadata"
        },
    });

    Config.init();
});


