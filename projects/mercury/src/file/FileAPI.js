import {createClient} from "webdav";
import qs from 'qs';
import {compareBy, comparing} from '../common/utils/genericUtils';
// eslint-disable-next-line import/no-cycle
import {
    decodeHTMLEntities,
    encodePath,
    generateUniqueFileName,
    getFileName,
    joinPaths,
    joinPathsAvoidEmpty
} from './fileUtils';
import {handleHttpError} from "../common/utils/httpUtils";

// Ensure that the client passes along the credentials
const defaultOptions = {withCredentials: true, headers: {"X-Requested-With": "XMLHttpRequest"}};

// Keep all item properties
const includeDetails = {...defaultOptions, details: true};

export type File = {
    iri: string;
    filename: string;
    basename: string;
    lastmod: string;
    version?: number;
    size: number;
    type: string;
    dateCreated: string;
    dateModified?: string;
    dateDeleted?: string;
    access?: string;
    metadataLinks?: string[];
}

class FileAPI {
    constructor(remoteURL = '/api/webdav') {
        this.remoteURL = remoteURL;
    }

    uploadClient() {
        return createClient('/zuul' + this.remoteURL);
    }

    client() {
        return createClient(this.remoteURL);
    }

    stat(path, showDeleted = false, includeMetadataLinks = false) {
        const options = {
            ...includeDetails,
            data: "<propfind><allprop /></propfind>"
        };
        if (showDeleted) {
            options.headers = {...options.headers, "Show-Deleted": "on"};
        }
        if (includeMetadataLinks) {
            options.headers = {...options.headers, "With-Metadata-Links": true};
        }
        return this.client().stat(path, options)
            .then(result => this.mapToFile(result.data));
    }

    statForVersion(path, version) {
        const options = {
            ...includeDetails,
            data: "<propfind><allprop /></propfind>"
        };
        options.headers = {...options.headers, Version: version};

        return this.client().stat(path, options)
            .then(result => this.mapToFile(result.data));
    }

    /**
     * List directory contents
     * @param path        Full path within the collection
     * @param showDeleted Include deleted files and directories in the response
     * @returns {Promise<T>}
     */
    list(path, showDeleted = false): File[] {
        const options = {...includeDetails, data: '<propfind><allprop /></propfind>'};
        if (showDeleted) {
            options.headers = {...options.headers, "Show-Deleted": "on"};
        }
        return this.client().getDirectoryContents(path, options)
            .then(result => result.data
                .sort(comparing(compareBy('type'), compareBy('filename')))
                .map(this.mapToFile));
    }

    /**
     * Creates a new directory within the current collection
     * @param path      Full path within the collection
     * @param options
     * @returns {*}
     */
    createDirectory(path, options = defaultOptions) {
        return this.client().createDirectory(path, options)
            .catch(e => {
                if (e && e.response) {
                    // eslint-disable-next-line default-case
                    switch (e.response.status) {
                        case 400:
                            throw new Error("Unable to create the given directory. \nPlease check that the name does not contain special characters.");
                        case 403:
                            throw new Error("You do not have authorization to create a directory \nin this collection.");
                        case 405:
                            throw new Error("A directory or file with this name already exists. \nPlease choose another name");
                    }
                }

                return Promise.reject(e);
            });
    }

    uploadMulti(destinationPath, files: File[], maxFileSizeBytes: number, onUploadProgress = () => {}) {
        const totalSize = files.reduce((size, file) => size + file.size, 0);
        if (totalSize > maxFileSizeBytes) {
            return Promise.reject(new Error("Payload too large"));
        }
        const formData = new FormData();
        formData.append('action', 'upload_files');
        files.forEach(f => formData.append(encodeURIComponent(f.path), f));
        const requestOptions = {
            method: "POST",
            headers: {
                "Accept": "text/plain",
                "Content-Type": "multipart/form-data",
                "X-Requested-With": "XMLHttpRequest"
            },
            responseType: "text",
            onUploadProgress,
            data: formData
        };
        return this.uploadClient()
            .customRequest(destinationPath, requestOptions)
            .catch(e => {
                if (e && e.response) {
                    // eslint-disable-next-line default-case
                    switch (e.response.status) {
                        case 413:
                            throw new Error("Payload too large");
                    }
                }
                handleHttpError("Error uploading files");
            });
    }

    /**
     * It will calls the browser API to open the file if it's 'openable' otherwise the browser will show download dialog
     * @param path
     */
    open(path, version = null) {
        let link = this.getDownloadLink(path);
        if (version !== null) {
            link += `?version=${version}`;
        }
        window.open(link);
    }

    /**
     * It returns a public link where a file can be downloaded.
     */
    getDownloadLink = (path = '') => this.client().getFileDownloadLink(path);

    /**
     * Deletes the file given by path
     * @param path
     * @param showDeleted
     * @returns Promise<any>
     */
    delete(path, showDeleted = false) {
        const options = {...defaultOptions};
        if (showDeleted) {
            options.headers = {...options.headers, "Show-Deleted": "on"};
        }
        if (!path) return Promise.reject(Error("No path specified for deletion"));

        return this.client().deleteFile(path, options)
            .catch(e => {
                if (e && e.response) {
                    // eslint-disable-next-line default-case
                    switch (e.response.status) {
                        case 403:
                            throw new Error("Could not delete file or directory. Only admins can delete them.");
                    }
                }

                return Promise.reject(e);
            });
    }

    /**
     * Undeletes the file given by path
     * @param path
     * @returns Promise<any>
     */
    undelete(path) {
        if (!path) return Promise.reject(new Error("No path specified for undeleting"));
        return this.post(path, {action: 'undelete'}, true)
            .catch(e => {
                console.error("Could not undelete file or directory.", e);
                throw new Error("Could not undelete file or directory.");
            });
    }

    revertToVersion(path, version) {
        if (!path) return Promise.reject(Error("No path specified for version reverting"));

        return this.post(path, {action: 'revert', version})
            .catch(() => {
                throw new Error("Could not revert a file to a previous version.");
            });
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

        if (source === destination) {
            return Promise.resolve();
        }

        // We have to specify the destination ourselves, as the client() adds the fullpath
        // to the
        return this.client().moveFile(source, destination, defaultOptions)
            .catch(e => {
                if (e && e.response) {
                    // eslint-disable-next-line default-case
                    switch (e.response.status) {
                        case 400:
                            throw new Error("Could not move one or more files. Possibly the filename contains special characters.");
                        case 403:
                            throw new Error("Could not move one or more files. Only admins can move files.");
                        case 409:
                        case 412:
                            throw new Error("Could not move one or more files. The destination file already exists.");
                    }
                }

                return Promise.reject(e);
            });
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

        return this.client().copyFile(source, destination, defaultOptions)
            .catch(e => {
                if (e && e.response) {
                    // eslint-disable-next-line default-case
                    switch (e.response.status) {
                        case 403:
                            throw new Error("Could not copy one or more files. \nDo you have write permission to the destination collection?");
                        case 409:
                            throw new Error("Could not copy one or more files. \nThe destination can not be copied to.");
                        case 412:
                            throw new Error("Could not copy one or more files. \nThe destination file already exists.");
                    }
                }

                return Promise.reject(e);
            });
    }

    /**
     * Move one or more files to a destinationdir
     * @param filePaths
     * @param destinationDir
     * @returns {*}
     */
    movePaths(filePaths, destinationDir) {
        return this.uniqueDestinationPaths(filePaths, destinationDir)
            .then(mapping => Promise.all(mapping.map(([src, dst]) => this.move(src, dst))));
    }

    /**
     * Copies one or more files from to a destinationdir
     * @param filePaths
     * @param destinationDir
     * @returns {*}
     */
    copyPaths(filePaths, destinationDir) {
        return this.uniqueDestinationPaths(filePaths, destinationDir)
            .then(mapping => Promise.all(mapping.map(([src, dst]) => this.copy(src, dst))))
            .catch(e => {
                if (e && e.response) {
                    // eslint-disable-next-line default-case
                    switch (e.response.status) {
                        case 403:
                            throw new Error("Could not copy one or more files. \nDo you have write permission to the destination collection?");
                        case 409:
                            throw new Error("Could not copy one or more files. \nThe destination can not be copied to.");
                        case 412:
                            throw new Error("Could not copy one or more files. \nThe destination file already exists.");
                    }
                }

                return Promise.reject(e);
            });
    }

    /**
     * Generates unique (non-existing) file paths in the destinationdir adding indices to the file names when necessary
     * @param filePaths
     * @param destinationDir
     * @returns {Promise<Array<Array<string>>>} A list of source/destination combinations. The first entry in an array is the source path, the second entry is the associated unique destination path
     */
    uniqueDestinationPaths(filePaths, destinationDir) {
        return this.list(destinationDir)
            .then(files => files.map(f => f.basename))
            .then(usedNames => filePaths.map(sourceFile => {
                const destinationFilename = generateUniqueFileName(getFileName(sourceFile), usedNames);
                usedNames.push(destinationFilename);
                const destinationFile = joinPaths(destinationDir, destinationFilename);
                return [sourceFile, destinationFile];
            }));
    }

    /**
     * Delete one or more files
     * @param filenames
     * @param showDeleted
     * @returns {Promise}
     */
    deleteMultiple(filenames, showDeleted) {
        if (!filenames || filenames.length === 0) {
            return Promise.reject(new Error("No filenames given to delete"));
        }

        return Promise.all(filenames.map(filename => this.delete(filename, showDeleted)));
    }

    undeleteMultiple(filenames) {
        if (!filenames || filenames.length === 0) {
            return Promise.reject(new Error("No filenames given to undelete"));
        }
        return Promise.all(filenames.map(filename => this.undelete(filename)));
    }

    post(path, data, showDeleted = false) {
        const requestOptions = {
            method: "POST",
            url: joinPathsAvoidEmpty('/api/webdav', encodePath(path)),
            headers: {
                "Accept": "text/plain",
                "Content-Type": "application/x-www-form-urlencoded",
                "Show-Deleted": showDeleted ? "on" : "off",
                "X-Requested-With": "XMLHttpRequest"
            },
            responseType: "text",
            data: qs.stringify(data)
        };
        return this.client()
            .customRequest(path, requestOptions)
            .catch(handleHttpError("Error performing POST request"));
    }

    uploadMetadata(path, file) {
        const formData = new FormData();
        formData.append('action', 'upload_metadata');
        formData.append('file', file);
        const requestOptions = {
            method: "POST",
            headers: {
                "Accept": "text/plain",
                "Content-Type": "multipart/form-data",
                "X-Requested-With": "XMLHttpRequest"
            },
            responseType: "text",
            data: formData
        };
        return this.client()
            .customRequest(path, requestOptions)
            .catch(handleHttpError("Error uploading metadata"));
    }

    showFileHistory(file, startIndex, endIndex) {
        const versions = [];
        for (let i = file.version - startIndex; i >= file.version - endIndex && i >= 1; i -= 1) {
            versions.push(i);
        }
        if (versions.length === 0) return Promise.resolve();
        return Promise.all(versions.map(v => this.statForVersion(file.filename, v)));
    }

    mapToFile = (fileObject) => {
        const properties = {...fileObject, ...(fileObject.props || {})};
        delete properties.props;
        Object.keys(properties).forEach(key => {
            // The WebDAV client does not properly decode the XML response,
            // so we need to do that here
            const value = properties[key];
            properties[key] = (typeof value === 'string') ? decodeHTMLEntities(value) : value;
        });
        return properties;
    }
}

export const LocalFileAPI = new FileAPI();

export default FileAPI;
