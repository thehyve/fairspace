import Config from "./Config/Config";
import failOnHttpError from "../utils/httpUtils";
import {COLLECTION_SEARCH_TYPE, FILES_SEARCH_TYPE} from '../constants';
import {getSearchQueryFromString, getSearchTypeFromString} from '../utils/searchUtils';

const searchCollections = () => (
    fetch(Config.get().urls.collections, {
        method: 'GET',
        headers: new Headers({Accept: 'application/json'}),
        credentials: 'same-origin'
    })
        .then(failOnHttpError("Failure when searching collections"))
        .then(response => response.json())
);

const sampleFiles = [
    {
        filename: "/Jan_Smit_s_collection-500/dir1",
        basename: "dir1",
        lastmod: "Fri, 15 Feb 2019 09:40:16 GMT",
        size: 0,
        type: "directory"
    },
    {
        filename: "/Jan_Smit_s_collection-500/sub-dir",
        basename: "sub-dir",
        lastmod: "Fri, 15 Feb 2019 09:40:16 GMT",
        size: 0,
        type: "directory"
    },
    {
        filename: "/Jan_Smit_s_collection-500/file1.txt",
        basename: "file1.txt",
        lastmod: "Fri, 15 Feb 2019 09:40:16 GMT",
        size: 0,
        type: "file",
        mime: "text/plain"
    },
    {
        filename: "/Jan_Smit_s_collection-500/file2.txt",
        basename: "file2.txt",
        lastmod: "Fri, 15 Feb 2019 09:40:16 GMT",
        size: 0,
        type: "file",
        mime: "text/plain"
    }
];

const searchFiles = () => Promise.resolve(sampleFiles);

// eslint-disable-next-line import/prefer-default-export
export const performSearch = (search) => {
    const type = getSearchTypeFromString(search);
    const query = getSearchQueryFromString(search);

    switch (type) {
        case COLLECTION_SEARCH_TYPE:
            return searchCollections(query);
        case FILES_SEARCH_TYPE:
            return searchFiles(query);
        default:
            return Promise.resolve([]);
    }
};
