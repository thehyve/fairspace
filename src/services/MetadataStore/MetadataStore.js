import Config from "../../components/generic/Config/Config";

class MetadataStore {
    static postHeaders = new Headers({'Content-Type': 'application/json'});

    constructor() {
        this.collectionsBackendUrl = '/metadata/collections';
    }

    init() {
        Config.waitFor().then(() => {
            this.collectionMetadataUrlPattern = Config.get().metadata.urlPatterns.collections;
        });
    }

    addCollectionMetadata(collection) {
        let body = Object.assign({}, collection, {
            "uri": this.collectionMetadataUrlPattern.replace('{id}', collection.id)
        });

        return fetch(this.collectionsBackendUrl, {
            method: 'POST',
            headers: MetadataStore.postHeaders,
            credentials: "same-origin",
            body: JSON.stringify(body)
        }).then((response) => {
            if(!response.ok) {
                throw Error("Failure when adding collection to the metadata store", response.error);
            }

            return response;
        });
    }

    removeCollectionMetadata() {}
}

export default new MetadataStore();