import Config from "../../components/generic/Config/Config";

function failOnHttpError(response, message) {
    if(!response.ok) {
        throw Error(message, response.error);
    }
}

/**
 * Service to perform file operations
 */
class FileStore {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});
    static getHeaders = new Headers({'Accept': 'application/json'});

    constructor(collection) {
        this.collection = collection;
        this.params = collection.params;
        this.baseUrl = Config.get().urls.files;
    }

    list(path) {
        const pathId = this._getPathId(path);

        return fetch(this.baseUrl + '/' + pathId + '/children')
            .then(response => {
                failOnHttpError(response, "Failure when retrieving list of files");
                return response.json();
            })
            .then(json => json.items);
    }

    upload(path, files) {
        const pathId = this._getPathId(path);

        var data = new FormData()
        data.append('parentId', pathId);
        data.append('type', 'file');
        for (const file of files) {
            data.append('files', file, file.name);
        }

        return fetch(this.baseUrl, {
                method: 'POST',
                body: data
            }).then(response => {
                failOnHttpError(response, "Failure while uploading file");
                return response;
            })
    }

    _getPathId(path) {
        const parts = this._parsePath(path);
        const completePath = [this.params.path, ...parts].join('/');
        return btoa(completePath).replace(/=/g, '');
    }

    // Parse path into array
    _parsePath(path) {
        if(!path)
            return [];

        if(path[0] === '/')
            path = path.slice(1);

        return path ? path.split('/') : [];
    }

}

export default FileStore;