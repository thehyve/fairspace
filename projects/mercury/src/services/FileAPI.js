import {createClient} from "webdav";
import Config from "./Config/Config";
import {addCounterToFilename, joinPaths} from '../utils/fileUtils';
import axios from 'axios';

// Ensure that the window fetch method is used for webdav calls
// and that is passes along the credentials
const defaultOptions = {credentials: 'include', details: true};


axios.interceptors.request.use((config) => {
    if (config.method === 'propfind') {
        config.headers['content-type'] = 'application/xml';
        config.data = '<?xml version="1.0" encoding="utf-8" ?><propfind xmlns:D="DAV:"><allprop/></propfind>';
    }
    return config;
},
(error) => Promise.reject(error));

class FileAPI {
    constructor(collectionSubDirectory) {
        this.basePath = `/${collectionSubDirectory}`;

        const baseUrl = Config.get().urls.files;
        this.client = createClient(baseUrl);
    }

    /**
     * List directory contents
     * @param path      Full path within the collection
     * @returns {Promise<T>}
     */
    list(path) {
        const fullPath = this.getFullPath(path);

        return this.client.getDirectoryContents(fullPath, defaultOptions)
            .then(result => result.data);
    }

    /**
     * Creates a new directory within the current collection
     * @param path      Full path within the collection
     * @returns {*}
     */
    createDirectory(path) {
        if (!path) {
            return Promise.reject(Error("No path specified for directory creation"));
        }

        return this.client.createDirectory(this.getFullPath(path), defaultOptions);
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

        if (path === '/') {
            path = '';
        }

        const fullPath = this.getFullPath(path);
        const allPromises = files.map(file => this.client.putFileContents(`${fullPath}/${nameMapping.get(file.name)}`, file, defaultOptions));

        return Promise.all(allPromises).then(() => files);
    }

    /**
     * Downloads the file given by path. Downloading is done by redirecting the user to the file
     * @param path
     */
    download(path) {
        if (!path) {
            return;
        }

        window.location.href = this.client.getFileDownloadLink(this.getFullPath(path), defaultOptions);
    }

    /**
     * Deletes the file given by path
     * @param path
     * @returns Promise<any>
     */
    delete(path) {
        if (!path) return Promise.reject(Error("No path specified for deletion"));

        return this.client.deleteFile(this.getFullPath(path), defaultOptions);
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

        // We have to specify the destination ourselves, as the client adds the fullpath
        // to the
        return this.client.moveFile(this.getFullPath(source), this.getFullPath(destination), defaultOptions);
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

        return this.client.copyFile(this.getFullPath(source), this.getFullPath(destination), defaultOptions);
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
     * Move one or more files from a sourcedir to a destinationdir
     * @param sourceDir
     * @param filenames
     * @param destinationDir
     * @returns {*}
     */
    movePaths(sourceDir, filenames, destinationDir) {
        // Moving files to the current directory is a noop
        if (destinationDir === sourceDir) {
            return Promise.resolve();
        }

        return Promise.all(filenames.map((filename) => {
            const sourceFile = joinPaths(sourceDir || '', filename);
            const destinationFile = joinPaths(destinationDir || '', filename);
            return this.move(sourceFile, destinationFile);
        }));
    }

    /**
     * Copies one or more files from a sourcedir to a destinationdir
     * @param sourceDir
     * @param filenames
     * @param destinationDir
     * @returns {*}
     */
    copyPaths(sourceDir, filenames, destinationDir) {
        return Promise.all(filenames.map((filename) => {
            const sourceFile = joinPaths(sourceDir || '', filename);
            let destinationFilename = filename;

            // Copying files to the current directory involves renaming
            if (destinationDir === sourceDir) {
                destinationFilename = addCounterToFilename(destinationFilename);
            }

            const destinationFile = joinPaths(destinationDir || '', destinationFilename);

            return this.copy(sourceFile, destinationFile);
        }));
    }
}

export default FileAPI;
