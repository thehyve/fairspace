import CreateWebdavClient from "webdav";
import Config from "../Config/Config";

// Ensure that the window fetch method is used for webdav calls
// and that is passes along the credentials
const defaultOptions = {credentials: 'include'};
CreateWebdavClient.setFetchMethod((input, init) => {
    const options = init ? Object.assign({}, init, defaultOptions) : defaultOptions;

    return fetch(input, options);
});

/**
 * Service to perform file operations
 */
class FileAPI {
    static PATH_SEPARATOR = '/';

    constructor(collectionSubDirectory) {
        this.basePath = `/${collectionSubDirectory}`;

        const baseUrl = Config.get().urls.files;
        this.client = CreateWebdavClient(baseUrl);
    }

    /**
     * List directory contents
     * @param path      Full path within the collection
     * @returns {Promise<T>}
     */
    list(path) {
        const fullPath = this.getFullPath(path);

        return this.client
            .getDirectoryContents(fullPath);
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

        return this.client.createDirectory(this.getFullPath(path));
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

        const fullPath = this.getFullPath(path);

        return Promise.all(
            files.map(file => this.client.putFileContents(`${fullPath}/${nameMapping.get(file.name)}`, file))
        ).then(() => files);
    }

    /**
     * Downloads the file given by path. Downloading is done by redirecting the user to the file
     * @param path
     */
    download(path) {
        if (!path) {
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
        if (!path) return Promise.reject(Error("No path specified for deletion"));

        return this.client.deleteFile(this.getFullPath(path));
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
        return this.client.moveFile(this.getFullPath(source), this.getFullPath(destination));
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

        return this.client.copyFile(this.getFullPath(source), this.getFullPath(destination));
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
        return paths
            .map(p => (p && p !== '/' ? p : '')) // For falsy values, or '/', use an empty string
            .join(FileAPI.PATH_SEPARATOR);
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
            const sourceFile = this.joinPaths(sourceDir || '', filename);
            const destinationFile = this.joinPaths(destinationDir || '', filename);
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
            const sourceFile = this.joinPaths(sourceDir || '', filename);
            let destinationFilename = filename;

            // Copying files to the current directory involves renaming
            if (destinationDir === sourceDir) {
                destinationFilename = FileAPI.addCounterToFilename(destinationFilename);
            }

            const destinationFile = this.joinPaths(destinationDir || '', destinationFilename);

            return this.copy(sourceFile, destinationFile);
        }));
    }

    static addCounterToFilename(filename) {
        // Parse the filename
        const dotPosition = filename.lastIndexOf('.');
        let basename = filename.substring(0, dotPosition);
        const extension = filename.substring(dotPosition + 1);

        // By default the counter is set to 2
        let counter = 2;

        // Verify if the filename already contains a counter
        // If so, update the counter in the filename
        const counterMatch = / \((\d+)\)$/;
        const matches = basename.match(counterMatch);
        if (matches) {
            basename = basename.substring(0, basename.length - matches[0].length);
            counter = parseInt(matches[1], 10) + 1;
        }

        return `${basename} (${counter}).${extension}`;
    }
}

export default FileAPI;
