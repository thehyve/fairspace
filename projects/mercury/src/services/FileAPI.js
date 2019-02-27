import {createClient} from "webdav";
import Config from "./Config/Config";
import {addCounterToFilename, fileName, joinPaths, parentPath} from '../utils/fileUtils';
import axios from 'axios';

// Ensure that the window fetch method is used for webdav calls
// and that is passes along the credentials
const defaultOptions = {credentials: 'include'};


axios.interceptors.request.use((config) => {
    if (config.method === 'propfind') {
        config.headers['content-type'] = 'application/xml';
        config.data = '<?xml version="1.0" encoding="utf-8" ?><propfind xmlns:D="DAV:"><allprop/></propfind>';
    }
    return config;
},
(error) => Promise.reject(error));

class FileAPI {
    client() {
        if (!this.webDavClient) {
            this.webDavClient = createClient(Config.get().urls.files);
        }
        return this.webDavClient;
    }

    stat(path) {
        return this.client().stat(path, {credentials: 'include', details: true})
            .then(result => result.data);
    }

    /**
     * List directory contents
     * @param path      Full path within the collection
     * @returns {Promise<T>}
     */
    list(path) {
        return this.client().getDirectoryContents(path, {credentials: 'include', details: true})
            .then(result => result.data);
    }

    /**
     * Creates a new directory within the current collection
     * @param path      Full path within the collection
     * @returns {*}
     */
    createDirectory(path) {
        return this.client().createDirectory(path, defaultOptions);
    }

    /**
     * Uploads the given files into the provided path
     * @param path
     * @param files
     * @param nameMapping
     * @returns Promise<any>
     */
    upload(path, files, nameMapping) {
        if (!files) {
            return Promise.reject(Error("No files given"));
        }

        const allPromises = files.map(file => this.client().putFileContents(`${path}/${nameMapping.get(file.name)}`, file, defaultOptions));

        return Promise.all(allPromises).then(() => files);
    }

    /**
     * Downloads the file given by path. Downloading is done by redirecting the user to the file
     * @param path
     */
    download(path) {
        window.location.href = this.client().getFileDownloadLink(path, defaultOptions);
    }

    /**
     * Deletes the file given by path
     * @param path
     * @returns Promise<any>
     */
    delete(path) {
        if (!path) return Promise.reject(Error("No path specified for deletion"));

        return this.client().deleteFile(path, defaultOptions);
    }

    /**
     * Move the file specified by {source} to {destination}
     * @param source
     * @param destination
     * @returns Promise<any>
     */
    move(source, destination) {
        if (!source) {
            return Promise.reject(Error("No source specified to move"));
        }
        if (!destination) {
            return Promise.reject(Error("No destination specified to move to"));
        }

        // We have to specify the destination ourselves, as the client() adds the fullpath
        // to the
        return this.client().moveFile(source, destination, defaultOptions);
    }

    /**
     * Copy the file specified by {source} to {destination}
     * @param source
     * @param destination
     * @returns Promise<any>
     */
    copy(source, destination) {
        if (!source) {
            return Promise.reject(Error("No source specified to copy"));
        }
        if (!destination) {
            return Promise.reject(Error("No destination specified to copy to"));
        }

        return this.client().copyFile(source, destination, defaultOptions);
    }


    /**
     * Move one or more files to a destinationdir
     * @param filePaths
     * @param destinationDir
     * @returns {*}
     */
    movePaths(filePaths, destinationDir) {
        return Promise.all(filePaths.map((sourceFile) => {
            const destinationFile = joinPaths(destinationDir, fileName(sourceFile));
            return this.move(sourceFile, destinationFile);
        }));
    }

    /**
     * Copies one or more files from to a destinationdir
     * @param filePaths
     * @param destinationDir
     * @returns {*}
     */
    copyPaths(filePaths, destinationDir) {
        return Promise.all(filePaths.map((sourceFile) => {
            let destinationFilename = fileName(sourceFile);
            // Copying files to the current directory involves renaming
            if (destinationDir === parentPath(sourceFile)) {
                destinationFilename = addCounterToFilename(destinationFilename);
            }

            const destinationFile = joinPaths(destinationDir, destinationFilename);

            return this.copy(sourceFile, destinationFile);
        }));
    }
}

export default new FileAPI();
