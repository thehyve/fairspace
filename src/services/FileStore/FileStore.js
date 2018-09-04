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
    static PATH_SEPARATOR = '/';

    constructor(collectionSubDirectory) {
        this.basePath = '/' + collectionSubDirectory;

        const baseUrl = Config.get().urls.files;
        this.client = CreateWebdavClient(baseUrl)
    }

    /**
     * List directory contents
     * @param path
     * @returns {Promise<T>}
     */
    list(path) {
        const fullPath = this.getFullPath(path);

        return this.client
            .getDirectoryContents(fullPath);
    }

    createDirectory(path) {
        if(!path) {
            return Promise.reject("No path specified for directory creation");
        }

        return this.client.createDirectory(this.getFullPath(path))
    }

    /**
     * Uploads the given files into the provided path
     * @param path
     * @param files
     * @returns Promise<any>
     */
    upload(path, files) {
        if(!files) {
            return Promise.reject("No files given");
        }

        const fullPath = this.getFullPath(path);

        return Promise.all(
            files.map(file =>
                this.client.putFileContents(fullPath + '/' + file.name, file))
        );
    }

    /**
     * Downloads the file given by path. Downloading is done by redirecting the user to the file
     * @param path
     */
    download(path) {
        if(!path) {
            return;
        }

        window.location.href = this.client.getFileDownloadLink(this.getFullPath(path));
    }

    /**
     * Deletes the file given by path
     * @param path
     * @returns Promise<any>
     */
    delete(path) {
        if(!path)
            return Promise.reject("No path specified for deletion");

        return this.client.deleteFile(this.getFullPath(path))
    }

    /**
     * Move the file specified by {source} to {destination}
     * @param source
     * @param destination
     * @returns Promise<any>
     */
    move(source, destination) {
        if (!source) {
            return Promise.reject("No source specified to move");
        }
        if (!destination) {
            return Promise.reject("No destination specified to move to");
        }

        return this.client.moveFile(this.getFullPath(source), this.getFullPath(destination))
    }

    /**
     * Copy the file specified by {source} to {destination}
     * @param source
     * @param destination
     * @returns Promise<any>
     */
    copy(source, destination) {
        if (!source) {
            return Promise.reject("No source specified to copy");
        }
        if (!destination) {
            return Promise.reject("No destination specified to copy to");
        }

        return this.client.copyFile(this.getFullPath(source), this.getFullPath(destination))
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
     * Combines multiple parts of the path with the proper separator
     * @param paths
     */
    joinPaths(...paths) {
        return paths.join(FileStore.PATH_SEPARATOR);
    }

}

export default FileStore;