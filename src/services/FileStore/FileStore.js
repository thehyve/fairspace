import Config from "../../components/generic/Config/Config";
import CreateWebdavClient from "webdav";

// Ensure that the window fetch method is used for webdav calls
// and that is passes along the credentials
const defaultOptions = { credentials: 'same-origin' };
CreateWebdavClient.setFetchMethod((input, init) => {
    const options = init ? Object.assign({}, init, defaultOptions) : defaultOptions;

    return fetch(input, options);
})

/**
 * Service to perform file operations
 */
class FileStore {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});
    static getHeaders = new Headers({'Accept': 'application/json'});

    constructor(collection) {
        this.collection = collection;
        this.basePath = '/' + collection.typeIdentifier;

        const baseUrl = Config.get().urls.files;
        this.client = CreateWebdavClient(baseUrl)
    }

    list(path) {
        const fullPath = this.getFullPath(path);

        return this.client
            .getDirectoryContents(fullPath);
    }

    upload(path, files) {
        if(!files) {
            return;
        }

        const fullPath = this.getFullPath(path);

        return Promise.all(
            files.map(file =>
                this.client.putFileContents(fullPath + '/' + file.name, file))
        );
    }

    download(fullPath) {
        if(!fullPath) {
            return;
        }

        console.log(this.client.getFileDownloadLink(fullPath));
        window.location.href = this.client.getFileDownloadLink(fullPath);
    }

    /**
     * Converts the path within a collection to a path with the base path
     * @param path
     * @returns {string|*}
     */
    getFullPath(path) {
        return path ? this.basePath + path : this.basePath;
    }

    /**
     * Converts a path as given by the backend to a path within the collection
     * @param path
     * @returns {*}
     */
    getPathWithinCollection(path) {
        return path ? path.replace(this.basePath, '') : path;
    }
}

export default FileStore;