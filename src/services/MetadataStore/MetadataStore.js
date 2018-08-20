import Config from "../../components/generic/Config/Config";

function failOnHttpError(response, message) {
    if(!response.ok) {
        throw Error(message, response.error);
    }
}

class MetadataStore {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});
    static getHeaders = new Headers({'Accept': 'application/json'});

    constructor() {
    }

    init() {
        return Config.waitFor().then(() => {
            this.metadataUrl = Config.get().urls.metadata;
        });
    }

}

export default new MetadataStore();