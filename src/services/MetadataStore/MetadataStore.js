import Config from "../../components/generic/Config/Config";

class MetadataStore {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});
    static getHeaders = new Headers({'Accept': 'application/json'});

    init() {
        return Config.waitFor().then(() => {
            this.metadataUrl = Config.get().urls.metadata;
        });
    }

}

export default new MetadataStore();