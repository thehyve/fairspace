import CreateWebdavClient from "webdav";

import Config from "./Config/Config";
import failOnHttpError from "../utils/httpUtils";

const getHeaders = new Headers({Accept: 'application/json'});

export const searchCollections = () => {
    return fetch(Config.get().urls.collections, {
        method: 'GET',
        headers: getHeaders,
        credentials: 'same-origin'
    })
        .then(failOnHttpError("Failure when searching collections"))
        .then(response => response.json());
};

export const searchFiles = () => CreateWebdavClient(Config.get().urls.files)
    .getDirectoryContents('/Jan_Smit_s_collection-500/');
